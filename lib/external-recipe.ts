import { parseQuantity, tryNormaliseQuantity } from "./quantity";
import { tryStandardiseUnit } from "./units";

export const parseExternalTotalTime = (timeVal: string) => {
  const timeStr = timeVal.substring(0, timeVal.length - 1).split("T")[1];
  return Number(timeStr);
};

export const parseExternalIngredients = (ingredientsVal: string[]) => {
  return ingredientsVal.map((raw) => {
    let ingredient = raw.toLowerCase();

    // Remove brackets/notes
    ingredient = removeParentheses(ingredient);

    // Normalise separators
    ingredient = ingredient.replace(/\s+/g, " ").trim();

    // Remove alternate measurements:
    // 340g/12oz -> 340g
    ingredient = ingredient.replace(
      /(\d+(?:\.\d+)?)\s*(kg|g|ml|l|oz|lbs?|lb)\s*\/\s*\d+(?:\.\d+)?\s*(kg|g|ml|l|oz|lbs?|lb)\b/gi,
      "$1$2",
    );

    // Keep first ingredient name option:
    // flour / all-purpose flour -> flour
    ingredient = ingredient
      .split(/\s+\/\s+/)[0]
      .split(/\s+or\s+/)[0]
      .trim();

    // Normalise "1 x 340g can"
    ingredient = ingredient.replace(
      /^(\d+)\s*x\s*(\d+(?:\.\d+)?)(g|kg|ml|l|oz|lb|lbs)\b/,
      "$1 $2$3",
    );

    const { quantity, name } = extractIngredientPrefix(ingredient);

    return {
      name,
      quantity,
      raw: ingredient,
    };
  });
};

function extractIngredientPrefix(value: string) {
  const tokens = value
    .replace(/(\d+\/\d+|\d+(?:\.\d+)?)(?=[a-z])/g, "$1 ")
    .split(/\s+/)
    .filter(Boolean);

  let quantityEnd = 0;

  // Only search the first few tokens for quantity
  // Ingredients shouldn't have a quantity 10 words in.
  for (let i = 1; i <= Math.min(4, tokens.length); i++) {
    const candidate = tokens.slice(0, i).join(" ");

    if (tryNormaliseQuantity(candidate) !== null) {
      quantityEnd = i;
    }
  }

  if (!quantityEnd) {
    return {
      quantity: "1",
      name: value,
    };
  }

  const remaining = tokens.slice(quantityEnd);

  let unitLength = 0;

  // Look immediately after quantity for units
  for (let i = 1; i <= Math.min(3, remaining.length); i++) {
    const candidate = remaining.slice(0, i).join(" ");

    if (tryStandardiseUnit(candidate)) {
      unitLength = i;
      break;
    }
  }

  if (unitLength) {
    return {
      quantity: [
        ...tokens.slice(0, quantityEnd),
        ...remaining.slice(0, unitLength),
      ].join(" "),
      name: remaining.slice(unitLength).join(" "),
    };
  }

  // Quantity exists but no unit
  return {
    quantity: tokens.slice(0, quantityEnd).join(" "),
    name: remaining.join(" "),
  };
}

function removeParentheses(value: string) {
  let result = value;

  while (/\([^()]*\)/.test(result)) {
    result = result.replace(/\([^()]*\)/g, "");
  }

  return result.replace(/\s+/g, " ").trim();
}

// TODO: handle HowToSteps inside array of HowToSections (cake, icing, etc.)
export const parseExternalInstructions = (instructionsVal) => {
  const howToSteps = instructionsVal.filter(
    (item) => item["@type"] === "HowToStep",
  );

  let stepNumber = 0;
  const instructions = howToSteps.map((step) => {
    stepNumber += 1;
    return {
      stepNumber,
      method: step.text,
    };
  });

  return instructions;
};

export const parseExternalServings = (servingsVal: string[]) => {
  // assuming servingsVal is list like ['5', '5 - 6 people']
  return Number(servingsVal[0]);
};

export const parseExternalImages = (imagesVal: string[]) => {
  // assuming imagesVal is an array of image urls, smallest to largest resolution
  return imagesVal[0];
};
