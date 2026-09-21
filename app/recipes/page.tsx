"use client";

import { RecipeTable } from "@/components/recipes/recipe-table";
import { Suspense } from "react";

export default function RecipesPage() {
  return (
    <main className="p-6">
      <Suspense>
        <RecipeTable />
      </Suspense>
    </main>
  );
}
