import { MealPlannerCalendar } from "@/components/meal-planner/calendar";
import { MealPlannerHeader } from "@/components/meal-planner/header";
import { Suspense } from "react";
export default function ShoppingListPage() {
  return (
    <Suspense>
      <main className="p-6 space-y-2">
        <MealPlannerHeader />
        <MealPlannerCalendar />
      </main>
    </Suspense>
  );
}
