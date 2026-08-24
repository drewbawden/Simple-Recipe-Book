import {
  NormalUnit,
  ShoppingListSortOption,
} from "@/app/generated/prisma/enums";

export const computeQuantity = (sources: any) => {
  let totalNormalQuantity = 0.0;
  let totalStandardQuantity = 0.0;
  let totalQuantity = 0.0;
  const standardUnits = new Set<string>();
  const normalUnits = new Set<string>();
  const stringUnits = new Set<string>();
  for (let i = 0; i < sources.length; i++) {
    const standardQuantity = sources[i].recipeIngredient.standardQuantity
      ? Number(sources[i].recipeIngredient.standardQuantity)
      : null;
    const normalQuantity = sources[i].recipeIngredient.normalQuantity
      ? Number(sources[i].recipeIngredient.normalQuantity)
      : null;
    if (standardQuantity) {
      totalStandardQuantity += standardQuantity;
    }
    if (normalQuantity) {
      totalNormalQuantity += normalQuantity;
    }

    const standardUnit = sources[i].recipeIngredient.standardUnit;
    const normalUnit = sources[i].recipeIngredient.normalUnit;
    const unit = sources[i].recipeIngredient.unit;
    if (standardUnit) {
      standardUnits.add(standardUnit);
    }
    if (normalUnit) {
      normalUnits.add(normalUnit);
    }
    if (unit) {
      stringUnits.add(unit);
    }
  }
  let totalUnit = "";
  const firstNormal = Array.from(normalUnits)[0];
  const firstStandard = Array.from(standardUnits)[0];
  const firstString = Array.from(stringUnits)[0];
  // more than one normal unit
  if (normalUnits.size > 1) {
    totalUnit = "mixed units";
  }
  // no normal or standard units
  else if (firstStandard === null) {
    totalQuantity = totalStandardQuantity;
  }
  // one normal unit, but multiple standards
  else if (standardUnits.size > 1 && normalUnits.size === 1) {
    totalUnit = firstNormal?.toLowerCase() + "s";
    totalQuantity = totalNormalQuantity;
  }
  // one standard, but multiple strings
  else if (stringUnits.size > 1 && standardUnits.size === 1) {
    totalUnit = firstStandard?.toLowerCase() + "s";
    totalQuantity = totalStandardQuantity;
  }
  // multiple individual units
  else if (firstNormal === NormalUnit.INDIVIDUAL) {
    totalUnit = firstString?.toLowerCase();

    totalQuantity = totalStandardQuantity;
    if (!totalUnit.endsWith("s") && totalStandardQuantity > 1) {
      totalUnit += "s";
    }
  }
  // one standard and normal unit
  else if (normalUnits.size === 1 && standardUnits.size === 1) {
    totalQuantity = totalStandardQuantity;
    totalUnit = firstStandard?.toLowerCase() + "s";
  }

  return {
    totalQuantity,
    totalUnit,
  };
};

const alphabeticalListSort = (property: string) => {
  let sortOrder = 1;
  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substring(1);
  }
  return function (a: any, b: any) {
    const result =
      a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
    return result * sortOrder;
  };
};

const manualListSort = (property: string) => {
  return (a: any, b: any) => {
    return a[property] - b[property];
  };
};

export const sortShoppingList = (ShoppingList, categories) => {
  switch (ShoppingList.categorySortOrder) {
    case ShoppingListSortOption.ALPHABETICAL:
      categories.sort(alphabeticalListSort("slug"));
      break;
    case ShoppingListSortOption.REVERSE_ALPHABETICAL:
      categories.sort(alphabeticalListSort("-slug"));
      break;
    case ShoppingListSortOption.MANUAL:
      categories.sort(manualListSort("orderIndex"));
      break;
    case ShoppingListSortOption.AUTOMATIC:
      // TODO
      break;
  }
  return categories;
};
