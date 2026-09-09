import { Suspense } from "react";

import { ShoppingList } from "@/components/shopping-list/shopping-list";

export default function ShoppingListPage() {
  return (
    <main className="p-6">
      <Suspense fallback={<p>Loading Items...</p>}>
        <ShoppingList />
      </Suspense>
    </main>
  );
}
