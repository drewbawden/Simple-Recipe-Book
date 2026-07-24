"use server";

import {
  RecipeType,
  Locations,
  NormalUnit,
  StandardUnit,
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
};

export type enumType =
  | "normalUnits"
  | "standardUnits"
  | "recipeType"
  | "locations";

export async function getEnums(type: enumType, query = "") {
  const targetEnum = enumMaps[type];

  if (!targetEnum) return [];

  return targetEnum;
}
