import { getCategories } from "@/actions/items";
import { ShoppingList } from "@/app/generated/prisma/client";
import { ShoppingListSortOption } from "@/app/generated/prisma/enums";
import { EnumOptions } from "@/components/templates/options";
import { DraggableList } from "@/components/templates/reorderable-list";
import { Ref, useEffect, useState } from "react";

interface EditInfoPopupProps {
  initialData: ShoppingList | null;
  formRef: Ref<HTMLFormElement>;
  onSubmit: (formData: FormData) => void | Promise<void>;
}
export const EditInfoPopup = ({
  initialData,
  formRef,
  onSubmit,
}: EditInfoPopupProps) => {
  if (!initialData) {
    console.error("No initialData for ChangeSortOrderPopup");
    return;
  }

  return (
    <form ref={formRef} className="text-gray-900">
      <p>{initialData.name}</p>
    </form>
  );
};

interface ChangeSortOrderPopupProps {
  initialData: ShoppingListSortOption | null;
  formRef: Ref<HTMLFormElement>;
  onSubmit: (formData: FormData) => void | Promise<void>;
}
export const CategorySortOrderPopup = ({
  initialData,
  formRef,
  onSubmit,
}: ChangeSortOrderPopupProps) => {
  if (!initialData) {
    console.error("No initialData for ChangeSortOrderPopup");
    return;
  }

  const [sortOrder, setSortOrder] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] =
    useState<Awaited<ReturnType<typeof getCategories>>>(null);
  const [categoryOrder, setCategoryOrder] = useState(
    categories?.map((category) => ({
      id: category.slug,
      label: category.displayName ?? category.slug,
    })) ?? [],
  );

  useEffect(() => {
    const fetchList = async () => {
      try {
        const fetched = await getCategories();
        setCategories(fetched);
        setCategoryOrder(
          fetched?.map((category) => ({
            id: category.slug,
            label: category.displayName ?? category.slug,
          })) ?? [],
        );
      } catch (error) {
        console.error("Error fetching shopping list items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, []);

  const handleSortOptionSelected = (sortOptionArray: string[]) => {
    if (sortOptionArray.length < 1) {
      return;
    }
    const sortOption = sortOptionArray[0] as ShoppingListSortOption;
    setSortOrder(sortOption);
  };

  if (loading) {
    return <p>Loading Items...</p>;
  }

  return (
    <form
      ref={formRef}
      className="text-gray-900 space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        formData.append("categoryOrder", JSON.stringify(categoryOrder));
        onSubmit(formData);
      }}
    >
      <EnumOptions
        enumType="listSortOptions"
        selected={[sortOrder]}
        onChange={handleSortOptionSelected}
      />
      <input type="hidden" value={sortOrder} name="sortOrder" id="sortOrder" />
      <DraggableList
        items={categoryOrder}
        setItems={setCategoryOrder}
        display={sortOrder == ShoppingListSortOption.MANUAL}
      />
    </form>
  );
};

export const ItemSortOrderPopup = ({
  initialData,
  formRef,
  onSubmit,
}: ChangeSortOrderPopupProps) => {
  if (!initialData) {
    console.error("No initialData for ChangeSortOrderPopup");
    return;
  }

  const [sortOrder, setSortOrder] = useState(initialData);
  const [loading, setLoading] = useState(true);

  const handleSortOptionSelected = (sortOptionArray: string[]) => {
    if (sortOptionArray.length < 1) {
      return;
    }
    const sortOption = sortOptionArray[0] as ShoppingListSortOption;
    setSortOrder(sortOption);
  };

  if (loading) {
    return <p>Loading Items...</p>;
  }

  return (
    <form
      ref={formRef}
      className="text-gray-900 space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        onSubmit(formData);
      }}
    >
      <EnumOptions
        enumType="listSortOptions"
        selected={[sortOrder]}
        onChange={handleSortOptionSelected}
      />
      <input type="hidden" value={sortOrder} name="sortOrder" id="sortOrder" />
    </form>
  );
};
