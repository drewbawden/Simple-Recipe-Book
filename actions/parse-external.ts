"use server";

import {
  parseExternalImages,
  parseExternalIngredients,
  parseExternalInstructions,
  parseExternalServings,
  parseExternalTotalTime,
} from "@/lib/external-recipe";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

export const fetchExternalSite = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });
  if (!response.ok) {
    return NextResponse.json(
      { error: `Failed to fetch: ${response.status}` },
      { status: 502 },
    );
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

  const recipe = linkedData
    .flatMap((item) => item["@graph"] ?? [item])
    .find((item) => item["@type"] === "Recipe");

  let name = recipe.name || null;
  let totalTime = recipe.totalTime || null;
  let ingredients = recipe.recipeIngredient || null;
  let instructions = recipe.recipeInstructions || null;
  let servings = recipe.recipeYield || null;
  let images = recipe.image || null;

  if (totalTime !== null) {
    totalTime = parseExternalTotalTime(totalTime);
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
  if (images !== null) {
    images = parseExternalImages(images);
  }

  console.log(name);
  console.log(totalTime);
  console.log(ingredients);
  console.log(instructions);
  console.log(servings);
  console.log(images);
};
