import { zslCategorise } from "@/actions/product-classification";
import {
  fuzzyFindKeywords as fuzzyFindKeywords,
  getManualCategory,
} from "@/actions/shopping-lists";

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

export const computeCategory = async (
  productName: string,
): Promise<string | null> => {
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
  try {
    const zslScores = await zslCategorise(productName);
    const topZslScore = zslScores[0];
    if (topZslScore.confidence > 0.35 && topZslScore.category) {
      return String(topZslScore.category).toLowerCase();
    }
  } catch (error) {
    console.error("Failed to categorise with ZSL model");
  }

  return null;
};
