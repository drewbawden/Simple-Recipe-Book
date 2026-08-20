import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { categoryKeywords } from "@/prisma/seed-data/category-keywords";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Seeding category keywords...");

  await prisma.categoryKeyword.createMany({
    data: categoryKeywords,
    skipDuplicates: true,
  });

  console.log(`Seeded ${categoryKeywords.length} category keywords`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
