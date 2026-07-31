import { tryNormaliseQuantity } from "./quantity";
import { tryStandardiseUnit, UNIT_MAP } from "./units";

export const parseExternalTotalTime = (
  totalTime: string,
  prepTime: string,
  cookTime: string,
) => {
  const total =
    totalTime?.substring(0, totalTime.length - 1).split("T")[1] || null;
  const prep =
    prepTime?.substring(0, prepTime.length - 1).split("T")[1] || null;
  const cook =
    cookTime?.substring(0, cookTime.length - 1).split("T")[1] || null;

  if (total) {
    return Number(total);
  } else if (prep && cook) {
    return Number(prep) + Number(cook);
  } else if (prep) {
    return Number(prep);
  }
  return Number(cook);
};

export const parseExternalIngredients = (ingredientsVal: string[]) => {
  return ingredientsVal.map((raw) => {
    let ingredient = raw.toLowerCase();

    // Remove brackets/notes
    ingredient = removeParentheses(ingredient);

    // Normalise separators
    ingredient = ingredient.replace(/\s+/g, " ").trim();

    // 340g/12oz -> 340g
    ingredient = removeAlternateMeasurements(ingredient);

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

function removeAlternateMeasurements(value: string) {
  const units = Object.keys(UNIT_MAP)
    .sort((a, b) => b.length - a.length)
    .map((u) => u.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  const regex = new RegExp(
    `(\\d+(?:\\.\\d+)?(?:\\/\\d+)?)\\s*(${units})(?:\\s*\\/\\s*\\d+(?:\\.\\d+)?\\s*(${units}))+`,
    "gi",
  );

  return value.replace(regex, "$1$2");
}

function extractIngredientPrefix(value: string) {
  const tokens = value
    .replace(/(\d+\/\d+|\d+(?:\.\d+)?)(?=[a-z])/g, "$1 ")
    .split(/\s+/)
    .filter(Boolean);

  let quantityEnd = 0;

  // Ingredients shouldn't have a quantity 10 words in
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
  console.log(howToSteps);

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
