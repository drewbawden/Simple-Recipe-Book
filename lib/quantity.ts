import { wordsToNumbers } from "words-to-numbers";
import { tryStandardiseUnit, normaliseUnit } from "@/lib/units";

const UNICODE_FRACTIONS: Record<string, string> = {
  "½": "1/2",
  "⅓": "1/3",
  "⅔": "2/3",
  "¼": "1/4",
  "¾": "3/4",
  "⅕": "1/5",
  "⅖": "2/5",
  "⅗": "3/5",
  "⅘": "4/5",
  "⅙": "1/6",
  "⅚": "5/6",
  "⅛": "1/8",
  "⅜": "3/8",
  "⅝": "5/8",
  "⅞": "7/8",
};

const FRACTION_WORDS: Record<string, number> = {
  half: 1 / 2,
  halves: 1 / 2,

  third: 1 / 3,
  thirds: 1 / 3,

  quarter: 1 / 4,
  quarters: 1 / 4,

  fourth: 1 / 4,
  fourths: 1 / 4,

  fifth: 1 / 5,
  fifths: 1 / 5,

  sixth: 1 / 6,
  sixths: 1 / 6,

  seventh: 1 / 7,
  sevenths: 1 / 7,

  eighth: 1 / 8,
  eighths: 1 / 8,

  ninth: 1 / 9,
  ninths: 1 / 9,

  tenth: 1 / 10,
  tenths: 1 / 10,
};

function replaceUnicodeFractions(value: string): string {
  return value.replace(
    /[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/g,
    (match) => ` ${UNICODE_FRACTIONS[match]} `
  );
}

function parseSimpleFraction(value: string): number | null {
  const match = value.match(/^(\d+)\/(\d+)$/);

  if (!match) {
    return null;
  }

  const numerator = Number(match[1]);
  const denominator = Number(match[2]);

  if (denominator === 0) {
    return null;
  }

  return numerator / denominator;
}

function parseMixedFraction(value: string): number | null {
  const match = value.match(/^(\d+)\s+(\d+\/\d+)$/);

  if (!match) {
    return null;
  }

  const whole = Number(match[1]);
  const fraction = parseSimpleFraction(match[2]);

  if (fraction === null) {
    return null;
  }

  return whole + fraction;
}

function parseNumberWords(value: string): number | null {
  const result = wordsToNumbers(value);

  if (typeof result === "number") {
    return result;
  }

  if (typeof result === "string") {
    const number = Number(result);

    return Number.isNaN(number) ? null : number;
  }

  return null;
}

export function tryNormaliseQuantity(input: string | number): number | null {
  if (typeof input === "number") {
    return input;
  }

  let value = input.toLowerCase().trim();

  if (!value) {
    return null;
  }

  // treat "a" or "an" as the quantity 1
  if (value === "a" || value === "an") {
    return 1;
  }

  // convert unicode fractions
  value = replaceUnicodeFractions(value);

  // normalise punctuation
  value = value
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // "1½" becomes "1 1/2"ut
  value = value.replace(
    /^(\d+)\s+(1\/\d+)$/,
    "$1 $2"
  );

  // "a half" to "half"
  value = value.replace(/^a\s+/, "");

  // "1 1/2"
  const mixedFraction = parseMixedFraction(value);
  if (mixedFraction !== null) {
    return mixedFraction;
  }

  // "1/2"
  const fraction = parseSimpleFraction(value);
  if (fraction !== null) {
    return fraction;
  }

  // "quarter", "half", etc.
  if (FRACTION_WORDS[value]) {
    return FRACTION_WORDS[value];
  }

  // "three quarters"
  const fractionWordsMatch = value.match(
    /^(.+)\s+(half|halves|third|quarter|fourth|fifth|sixth|seventh|eighth|ninth|tenth)s?$/
  );
  if (fractionWordsMatch) {
    const numerator = parseNumberWords(fractionWordsMatch[1]);
    const denominator = FRACTION_WORDS[
      fractionWordsMatch[2].replace(/s$/, "")
    ];

    if (numerator !== null && denominator) {
      return numerator * denominator;
    }
  }

  // "one and a half"
  const andMatch = value.match(/^(.+)\s+and\s+(.+)$/);
  if (andMatch) {
    const whole = tryNormaliseQuantity(andMatch[1]);
    const fractionPart = tryNormaliseQuantity(andMatch[2]);

    if (whole !== null && fractionPart !== null) {
      return whole + fractionPart;
    }
  }

  // "one", "twenty one", etc.
  const words = parseNumberWords(value);
  if (words !== null) {
    return words;
  }

  // "1.4", "2"
  const numeric = Number(value);
  if (!Number.isNaN(numeric)) {
    return numeric;
  }

  return null;
}


export function parseQuantity(input: string) {
  const formattedInput = input.replace(/(\d+(?:\.\d+)?)([a-zA-Z\u½-⅞]+)/g, "$1 $2");

  const tokens = formattedInput.trim().replace(/\s+/g, ' ').split(' ');

  let quantityText = null;
  let unitText = null;
  let standardisedQuantity = null;
  let standardisedUnit = null;

  let quantityCutoff = 0;
  for (let i = 0; i < tokens.length; i++) {
    const tokensCutOff = tokens.slice(0, tokens.length - i);
    const standardQuantity = tryNormaliseQuantity(tokensCutOff.join(' '));
    if (standardQuantity !== null) {
      quantityText = tokensCutOff.join(' ');
      standardisedQuantity = standardQuantity;
      quantityCutoff = tokens.length - i;
      break;
    }
  }

  for (let i = 0; i < tokens.length - quantityCutoff; i++) {
    const tokensCutOff = tokens.slice(quantityCutoff + i, tokens.length);
    const standardUnit = tryStandardiseUnit(tokensCutOff.join(' '));

    if (standardUnit !== null) {
      unitText = tokensCutOff.join(' ');
      standardisedUnit = standardUnit;
      break;
    }
  }

  if (standardisedQuantity === null && standardisedUnit !== null) {
    quantityText = '';
    standardisedQuantity = 1;
  }

  const remainingTokens = tokens.slice(quantityCutoff);
  if (
    standardisedQuantity !== null &&
    remainingTokens.length > 0 &&
    standardisedUnit === null
  ) {
    throw new Error(`Unknown unit: ${remainingTokens.join(" ")}`);
  }

  let normalisedQuantity = null;
  let normalisedUnit = null;
  if (standardisedUnit !== null && standardisedQuantity !== null) {
    ({ normalisedQuantity, normalisedUnit } = normaliseUnit(standardisedQuantity, standardisedUnit))
  }
  else if (standardisedUnit === null && standardisedQuantity === null) {
    throw new Error('Unit or Quantity cannot be parsed');
  }

  return {
    quantity: quantityText,
    unit: unitText,
    ...(normalisedQuantity !== null && {
      normalisedQuantity,
    }),
    ...(normalisedUnit !== null && {
      normalisedUnit,
    }),
  }
}

export function isValidQuantity(input: string): boolean {
  try {
    parseQuantity(input);
    return true;
  } catch {
    return false;
  }
}
