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
      id: true,
      name: true,
    },
  });

  const categoryIdByName = new Map(
    categoryRows.map((category) => [category.name, category.id]),
  );

  console.log(`Found ${categoryRows.length} categories.`);

  const keywordData = categoryKeywords.map((kw) => {
    const { keyword, weight } = kw as any;

    if (kw.hasOwnProperty("categoryId") && kw.categoryId != null) {
      return {
        keyword,
        weight,
        categoryId: kw.categoryId,
      };
    }

    const categoryName = (kw as any).category;
    const categoryId = categoryIdByName.get(categoryName);

    if (!categoryId) {
      throw new Error(
        `Category "${categoryName}" not found while seeding keyword "${keyword}"`,
      );
    }

    return {
      keyword,
      weight,
      categoryId,
    };
  });

  console.log(`Seeding ${keywordData.length} category keywords...`);

  await prisma.categoryKeyword.createMany({
    data: keywordData,
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
