import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { categoryKeywords, categories } from "@/prisma/seed-data/data";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Seeding categories...");

  await prisma.itemCategory.createMany({
    data: categories,
    skipDuplicates: true,
  });

  const categoryRows = await prisma.itemCategory.findMany({
    select: {
      slug: true,
      displayName: true,
    },
  });

  console.log(`Found ${categoryRows.length} categories.`);

  const keywordData = categoryKeywords.map(
    ({ keyword, weight, categorySlug }) => {
      if (!categorySlug) {
        throw new Error(
          `Category "${categorySlug}" not found while seeding keyword "${keyword}"`,
        );
      }

      return {
        keyword,
        weight,
        categorySlug,
      };
    },
  );

  const dedupedKeywordData = Array.from(
    new Map(
      keywordData.map((k) => [`${k.keyword}::${k.categorySlug}`, k]),
    ).values(),
  );

  console.log(
    `Seeding ${dedupedKeywordData.length} unique category keywords...`,
  );

  await prisma.categoryKeyword.createMany({
    data: dedupedKeywordData,
    skipDuplicates: true,
  });

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
