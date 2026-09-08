"use server";

import {
  RecipeType,
  Locations,
  NormalUnit,
  StandardUnit,
  ShoppingListSortOption,
  ListItemSortOption,
} from "../app/generated/prisma/enums";

function formatEnum(enumObj: Record<string, string>) {
  return Object.values(enumObj).map((val) => ({
    id: val,
    name: val.replace(/_/g, " ").toLowerCase(),
  }));
}

const enumMaps = {
  normalUnits: formatEnum(NormalUnit),
  standardUnits: formatEnum(StandardUnit),
  recipeType: formatEnum(RecipeType),
  locations: formatEnum(Locations),
  listSortOptions: formatEnum(ShoppingListSortOption),
  itemSortOptions: formatEnum(ListItemSortOption),
};

export type enumType =
  | "normalUnits"
  | "standardUnits"
  | "recipeType"
  | "locations"
  | "listSortOptions"
  | "itemSortOptions";

export async function getEnums(type: enumType) {
  const targetEnum = enumMaps[type];

  if (!targetEnum) return [];

  return targetEnum;
}
