import { MealPlannerHeader } from "@/components/meal-planner/header";
import { Suspense } from "react";
export default function ShoppingListPage() {
  return (
    <Suspense>
      <main className="p-6">
        <MealPlannerHeader />
      </main>
    </Suspense>
  );
}
