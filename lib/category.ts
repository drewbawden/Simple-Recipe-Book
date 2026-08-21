import { zslCategorise } from "@/actions/product-classification";
import {
  fuzzyFindKeywords as fuzzyFindKeywords,
  getManualCategory,
} from "@/actions/shopping-lists";

export const categoryEnumToName = (catEnum: string | undefined | null) => {
  switch (catEnum) {
    case "frozen_foods":
      return "Frozen Foods";
    case "dairy_eggs_cheese":
      return "Dairy, Eggs & Cheese";
    case "fruit_veg":
      return "Fruit & Veg";
    case "household_items":
      return "Household Items";
    case "meat":
      return "Meat";
    case "coffee_tea":
      return "Coffee & Tea";
    case "beverages":
      return "Beverages";
    case "breads_cereals":
      return "Bread & Cereals";
    case "pasta_rice_beans":
      return "Pasta, Rice & Beans";
    case "canned_foods_soups":
      return "Canned Foods & Soups";
    case "personal_care_health":
      return "Personal Care & Health";
    case "pet_care":
      return "Pet Care";
    case "baking_items":
      return "Baking Items";
    case "spices_seasonings":
      return "Spices & Seasonings";
    case "oils_dressings":
      return "Oils & Dressings";
    case "wine_beer_spirits":
      return "Wine, Beer & Spirits";
    case "sauces_condiments":
      return "Sauces & Condiments";
    case "snacks_sweets":
      return "Snacks & Sweets";
    case "deli":
      return "Deli";
    case "seafood":
      return "Seafood";
    case "stationery":
      return "Stationery";
    default:
      return "Other";
  }
};

interface KeywordMatch {
  categorySlug: string;
  weight: number;
  confidence: number;
}

export const scoreKeywordMatches = (matches: KeywordMatch[]) => {
  const groupedMatches = matches.reduce<Record<string, KeywordMatch[]>>(
    (grouped, match) => {
      const category = match.categorySlug;
      grouped[category] = grouped[category] ?? [];
      grouped[category].push(match);
      return grouped;
    },
    {},
  );

  return Object.fromEntries(
    Object.entries(groupedMatches).map(([categorySlug, categoryMatches]) => {
      const positiveScore = categoryMatches.reduce((total, match) => {
        if (match.weight <= 0) {
          return total;
        }

        return total + match.weight * match.confidence;
      }, 0);

      const negativePenalty = categoryMatches.reduce((total, match) => {
        if (match.weight >= 0) {
          return total;
        }

        return total + Math.abs(match.weight) * match.confidence;
      }, 0);

      return [categorySlug, positiveScore - negativePenalty];
    }),
  );
};

const checkAgainstKeywords = async (productName: string) => {
  const matches = await fuzzyFindKeywords(productName);
  if (!matches.length) {
    return null;
  }

  return scoreKeywordMatches(
    matches.map((match) => ({
      categorySlug: match.categorySlug,
      weight: Number(match.weight),
      confidence: Number(match.confidence),
    })),
  );
};

export const computeCategory = async (productName: string) => {
  // 100% confidence
  const manualCategory = await getManualCategory(productName);
  if (manualCategory?.category?.slug) {
    return manualCategory.category.slug;
  }

  // Default to keywords
  const keywordScores = await checkAgainstKeywords(productName);
  if (keywordScores) {
    const [bestCategory, bestScore] = Object.entries(keywordScores).sort(
      ([, scoreA], [, scoreB]) => scoreB - scoreA,
    )[0] ?? [null, null];

    if (bestCategory && bestScore !== null && bestScore > 0.35) {
      return bestCategory;
    }
  }

  // Fallback to zsl model if previous checks returned no hits
  const zslScores = await zslCategorise(productName);
  const topZslScore = zslScores[0];
  if (topZslScore.confidence > 0.35 && topZslScore.category) {
    return String(topZslScore.category).toLowerCase();
  }

  return "other";
};
