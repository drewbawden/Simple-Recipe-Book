import { parseQuantity, tryNormaliseQuantity } from "./quantity";
import { tryStandardiseUnit } from "./units";

export const parseExternalTotalTime = (timeVal: string) => {
  const timeStr = timeVal.substring(0, timeVal.length - 1).split("T")[1];
  return Number(timeStr);
};

export const parseExternalIngredients = (ingredientsVal: string[]) => {
  const ingredients = ingredientsVal.map((ingredient) => {
    // convert to lower case
    ingredient = ingredient.toLowerCase();

    // remove context
    while (/\([^()]*\)/.test(ingredient)) {
      ingredient = ingredient.replace(/\([^()]*\)/g, "");
    }

    // remove alternate options
    ingredient = ingredient.split(" or ")[0];

    // differentiate between 1lb/500g and 3/4 cups, remove alternate unit option
    ingredient = ingredient
      .replace(/\s*\/\s*[\d./]+\s*[a-zA-Z]+\b/g, "") // remove "/ 250ml", "/ 2.5 lb", etc.
      .replace(/\s+/g, " ")
      .trim();

    // try to split into quantity+unit and name
    const formatted = ingredient
      .replace(/(\d+(?:\.\d+)?|\d+\/\d+)(?=[a-zA-Z])/g, "$1 ")
      .trim();
    const tokens = formatted.replace(/\s+/g, " ").split(" ");

    // find quantity cutoff (same as parseQuantity)
    let quantityCutoff = 0;
    for (let i = 0; i < tokens.length; i++) {
      const tokensCutOff = tokens.slice(0, tokens.length - i);
      const standardQuantity = tryNormaliseQuantity(tokensCutOff.join(" "));
      if (standardQuantity !== null) {
        quantityCutoff = tokens.length - i;
        break;
      }
    }

    let quantityForParse = "";
    let name = formatted;

    if (quantityCutoff > 0) {
      let unitLen = 0;
      let foundUnit = null as string | null;
      const maxUnitTokens = Math.min(3, tokens.length - quantityCutoff);

      for (let len = 1; len <= maxUnitTokens; len++) {
        const candidate = tokens
          .slice(quantityCutoff, quantityCutoff + len)
          .join(" ");
        if (tryStandardiseUnit(candidate) !== null) {
          unitLen = len;
          foundUnit = candidate;
          break;
        }
      }

      if (foundUnit) {
        quantityForParse = tokens.slice(0, quantityCutoff + unitLen).join(" ");
        name = tokens.slice(quantityCutoff + unitLen).join(" ");
      } else {
        // append generic individual unit
        const trailing = tokens.slice(quantityCutoff).join(" ");
        if (trailing) {
          quantityForParse =
            tokens.slice(0, quantityCutoff).join(" ") + " piece";
          name = trailing;
        } else {
          quantityForParse = tokens.slice(0, quantityCutoff).join(" ");
          name = "";
        }
      }
    } else {
      // no quantity detected — treat full string as name
      quantityForParse = "";
      name = formatted;
    }

    name = name.replace(/\s+/g, " ").trim();
    quantityForParse = quantityForParse.trim();

    try {
      if (quantityForParse) {
        parseQuantity(quantityForParse);
      }
    } catch (e) {
      console.warn("parseQuantity failed on:", quantityForParse, e);
    }

    return {
      name,
      quantity: quantityForParse,
      raw: ingredient,
    };
  });

  return ingredients;
};

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
