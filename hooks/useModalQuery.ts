"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type ModalName =
  | "addRecipe"
  | "editRecipe"
  | "ingredients"
  | "instructions"
  | "notes"
  | "addToShoppingList"
  | "editItem"
  | "editList"
  | "sortCategories"
  | "sortItems"
  | "editTags";

export type ModalParams = Record<string, string | number | null | undefined>;

const contextParamNames = ["recipeId", "itemId"] as const;

export function useModalQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const modal = searchParams.get("modal") as ModalName | null;

  const setModal = (value: ModalName | null, modalParams: ModalParams = {}) => {
    const params = new URLSearchParams(searchParams.toString());

    contextParamNames.forEach((name) => params.delete(name));

    if (value) {
      params.set("modal", value);

      Object.entries(modalParams).forEach(([name, paramValue]) => {
        if (paramValue !== null && paramValue !== undefined) {
          params.set(name, String(paramValue));
        }
      });
    } else {
      params.delete("modal");
    }

    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, {
      scroll: false,
    });
  };

  return {
    modal,
    openModal: setModal,
    closeModal: () => setModal(null),
    getModalParam: (name: string) => searchParams.get(name),
  };
}
