"use server";

import {
  parseExternalImages,
  parseExternalIngredients,
  parseExternalInstructions,
  parseExternalServings,
  parseExternalTotalTime,
} from "@/lib/external-recipe";
import * as cheerio from "cheerio";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const getExternalImageUrl = (image: unknown): string | null => {
  if (!image) return null;
  if (typeof image === "string") return image;
  if (Array.isArray(image)) return image[0] ?? null;
  if (typeof image === "object" && image !== null) {
    return (image as any).url ?? null;
  }
  return null;
};

export const downloadExternalRecipeImage = async (
  image: unknown,
): Promise<string | null> => {
  const imageUrl = getExternalImageUrl(image);
  if (!imageUrl) return null;

  const response = await fetch(imageUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });
  if (!response.ok) return null;

  const buffer = Buffer.from(await response.arrayBuffer());
  const extension =
    imageUrl
      .split(".")
      .pop()
      ?.split(/[#?]/)[0]
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "jpg";
  const filename = `${randomUUID()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "recipe-pictures");

  await writeFile(path.join(uploadDir, filename), buffer);
  return `/recipe-pictures/${filename}`;
};

export const fetchExternalSite = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });
  if (!response.ok) {
    return null;
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const linkedData = $("script[type='application/ld+json']")
    .map((_, el) => {
      const content = $(el).html()?.trim();

      if (!content) return null;

      try {
        return JSON.parse(content);
      } catch {
        return null;
      }
    })
    .get()
    .filter(Boolean);

  if (!linkedData) {
    return null;
  }

  const recipe = linkedData
    .flatMap((item) => item["@graph"] ?? [item])
    .find((item) => item["@type"] === "Recipe");

  if (!recipe) {
    return null;
  }

  let name = recipe.name || null;
  let totalTime = recipe.totalTime || null;
  let prepTime = recipe.prepTime || null;
  let cookTime = recipe.cookTime || null;
  let ingredients = recipe.recipeIngredient || null;
  let instructions = recipe.recipeInstructions || null;
  let servings = recipe.recipeYield || null;
  let image = recipe.image || null;

  if (totalTime || prepTime || cookTime) {
    totalTime = parseExternalTotalTime(totalTime, prepTime, cookTime);
  }
  if (ingredients !== null) {
    ingredients = parseExternalIngredients(ingredients);
  }
  if (instructions !== null) {
    instructions = parseExternalInstructions(instructions);
  }
  if (servings !== null) {
    servings = parseExternalServings(servings);
  }
  if (image !== null) {
    image = parseExternalImages(image);
  }

  return {
    name,
    totalTime,
    ingredients,
    instructions,
    servings,
    image,
  };
};
