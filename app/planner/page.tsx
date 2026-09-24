import { MealPlannerCalendar } from "@/components/meal-planner/calendar";
import { MealPlannerHeader } from "@/components/meal-planner/header";
import { Suspense } from "react";

function MealPlannerContent() {
  return (
    <main className="space-y-2 p-6">
      <MealPlannerHeader />
      <MealPlannerCalendar />
    </main>
  );
}

export default function MealPlannerPage() {
  return (
    <Suspense>
      <MealPlannerContent />
    </Suspense>
  );
}
