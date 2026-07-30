import { parseQuantity } from "./quantity";

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

    return ingredient;
  });

  return ingredients;
};

export const parseExternalInstructions = (instructionsVal) => {
  const howToSteps = instructionsVal.filter(
    (item) => item["@type"] === "HowToStep",
  );

  const instructions = howToSteps.map((step) => {
    return step.text;
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
