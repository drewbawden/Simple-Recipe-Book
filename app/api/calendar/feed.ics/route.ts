import { createEvents } from "ics";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export const dynamic = "force-dynamic";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const toUtcDateArray = (date: Date): [number, number, number] => [
  date.getUTCFullYear(),
  date.getUTCMonth() + 1,
  date.getUTCDate(),
];

export async function GET(request: Request) {
  const meals = await prisma.mealPlanItem.findMany({
    include: {
      recipe: {
        select: { name: true },
      },
    },
    orderBy: { startDate: "asc" },
  });

  const { error, value } = createEvents(
    meals.map((meal) => {
      const inclusiveEndDate = new Date(meal.endDate);
      inclusiveEndDate.setUTCDate(inclusiveEndDate.getUTCDate() + 1);

      const recipeUrl = new URL("/planner", request.url);
      recipeUrl.searchParams.set("modal", "recipeOverview");
      recipeUrl.searchParams.set("recipeId", String(meal.recipeId));

      return {
        uid: `meal-${meal.id}@home-utils`,
        title: meal.customText || meal.recipe?.name || "Meal",
        url: meal.recipeId ? recipeUrl.toString() : undefined,
        description: meal.recipeId
          ? "Open in Homely to view recipe"
          : undefined,
        categories: [meal.mealType],
        start: toUtcDateArray(meal.startDate),
        end: toUtcDateArray(inclusiveEndDate),
      };
    }),
    { calName: "Homely Meal Plan" },
  );

  if (error || !value) {
    return new Response("Unable to generate calendar", { status: 500 });
  }

  return new Response(value, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="calendar.ics"',
      "Cache-Control": "no-store",
    },
  });
}
