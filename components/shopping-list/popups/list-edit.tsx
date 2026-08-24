import { getCategories } from "@/actions/items";
import {
  ShoppingList,
  ShoppingListSortOption,
} from "@/app/generated/prisma/client";
import { EnumOptions } from "@/components/templates/options";
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
export const ChangeSortOrderPopup = ({
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

  useEffect(() => {
    const fetchList = async () => {
      try {
        const fetched = await getCategories();
        setCategories(fetched);
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
      className="text-gray-900"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(new FormData(event.currentTarget));
      }}
    >
      <EnumOptions
        enumType="listSortOptions"
        selected={[sortOrder]}
        onChange={handleSortOptionSelected}
      />
      <input type="hidden" value={sortOrder} name="sortOrder" id="sortOrder" />
      {/* <br />
      {categories?.map((category) => (
        <p key={category.slug}>{category.displayName}</p>
      ))} */}
    </form>
  );
};
