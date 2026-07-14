"use server"

import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { NormalUnit, RecipeTypes, Locations, StandardUnit } from "../app/generated/prisma/enums"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});


const formatEnum = (enumObj: Record<string, string>) =>
  Object.values(enumObj).map((val) => ({
    id: val,
    name: val.replace(/_/g, '').toLowerCase(),
  }));

const enumMaps = {
  normalUnits: formatEnum(NormalUnit),
  standardUnits: formatEnum(StandardUnit),
  recipeTypes: formatEnum(RecipeTypes),
  locations: formatEnum(Locations),
};

const autocompleteMap: Record<string, (query: string) => Promise<{ id: string | number; name: string }[]>> = {
  normalUnits: async (q) => enumMaps.normalUnits.filter((u) => u.name.includes(q.toLowerCase())),
  standardUnits: async (q) => enumMaps.standardUnits.filter((u) => u.name.includes(q.toLowerCase())),
  recipeTypes: async (q) => enumMaps.recipeTypes.filter((rt) => rt.name.includes(q.toLowerCase())),
  locations: async (q) => enumMaps.locations.filter((l) => l.name.includes(q.toLowerCase())),

  recipes: async (q) => prisma.recipes.findMany({
    where: { name: { contains: q, mode: 'insensitive' } },
    take: 8,
    select: { id: true, name: true },
  }),
  foods: async (q) => prisma.item.findMany({
    where: { name: { contains: q, mode: 'insensitive' } },
    take: 8,
    select: { id: true, name: true },
  }),
  products: async (q) => prisma.storeProduct.findMany({
    where: { name: { contains: q, mode: 'insensitive' } },
    take: 8,
    select: { id: true, name: true },
  }),
  categories: async (q) => prisma.category.findMany({
    where: { name: { contains: q, mode: 'insensitive' } },
    take: 8,
    select: { id: true, name: true },
  }),
};

export type AutocompleteType = 'normalUnits' | 'standardUnits' | 'locations' | 'recipeTypes' | 'recipes' | 'items' | 'storeProducts' | 'categories';

export async function getAutocompleteSuggestions(type: AutocompleteType, query: string) {
  const searcher = autocompleteMap[type];

  if (!searcher || !query || query.trim().length < 1) {
    return [];
  }

  try {
    return await searcher(query.trim());
  } catch (error) {
    console.error(`Failed to autocomplete for target: ${type}`, error);
    return [];
  }
}
