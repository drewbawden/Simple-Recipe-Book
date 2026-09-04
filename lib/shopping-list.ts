import {
  ListItemSortOption,
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

const alphabeticalSort = <T>(getValue: (item: T) => string) => {
  return (a: T, b: T) =>
    getValue(a).localeCompare(getValue(b), undefined, {
      sensitivity: "base",
    });
};

const reverseAlphabeticalSort = <T>(getValue: (item: T) => string) => {
  return (a: T, b: T) =>
    getValue(b).localeCompare(getValue(a), undefined, {
      sensitivity: "base",
    });
};

const manualListSort = (property: string) => {
  return (a: any, b: any) => {
    return a[property] - b[property];
  };
};

export const sortShoppingList = (ShoppingList, categories) => {
  switch (ShoppingList.categorySortOrder) {
    case ShoppingListSortOption.ALPHABETICAL:
      categories.sort(alphabeticalSort((category) => category.slug));
      break;
    case ShoppingListSortOption.REVERSE_ALPHABETICAL:
      categories.sort(alphabeticalSort((category) => category.slug));
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

export const sortShoppingListItems = (shoppingList, categories) => {
  return categories.map((category) => {
    const items = [...category.items];

    switch (shoppingList.itemSortOrder) {
      case ListItemSortOption.ALPHABETICAL:
        items.sort(alphabeticalSort((item) => item.item.name));
        break;

      case ListItemSortOption.REVERSE_ALPHABETICAL:
        items.sort(reverseAlphabeticalSort((item) => item.item.name));
        break;

      case ListItemSortOption.CREATION_DATE:
        items.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;

      case ListItemSortOption.REVERSE_CREATION_DATE:
        items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;

      case ListItemSortOption.PRIORITY:
        items.sort((a, b) => {
          if (a.urgent !== b.urgent) {
            return a.urgent ? -1 : 1;
          }
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
          }
          return 0;
        });
        break;
    }

    return {
      ...category,
      items,
    };
  });
};
