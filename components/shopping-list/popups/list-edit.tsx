import { getCategories } from "@/actions/items";
import { ShoppingList } from "@/app/generated/prisma/client";
import {
  ListItemSortOption,
  ShoppingListSortOption,
} from "@/app/generated/prisma/enums";
import { EnumOptions } from "@/components/templates/options";
import { DraggableList } from "@/components/templates/reorderable-list";
import { EditableTag, Tag } from "@/types/list-item";
import { Trash2Icon } from "lucide-react";
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
    console.error("No initialData for EditInfoPopup");
    return;
  }

  return (
    <form ref={formRef} className="text-gray-900">
      <p>{initialData.name}</p>
    </form>
  );
};

interface CategorySortOrderPopupProps {
  initialData: ShoppingListSortOption | null;
  formRef: Ref<HTMLFormElement>;
  onSubmit: (formData: FormData) => void | Promise<void>;
}
export const CategorySortOrderPopup = ({
  initialData,
  formRef,
  onSubmit,
}: CategorySortOrderPopupProps) => {
  if (!initialData) {
    console.error("No initialData for CategorySortOrderPopup");
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

interface ItemSortOrderPopupProps {
  initialData: ListItemSortOption | null;
  formRef: Ref<HTMLFormElement>;
  onSubmit: (formData: FormData) => void | Promise<void>;
}
export const ItemSortOrderPopup = ({
  initialData,
  formRef,
  onSubmit,
}: ItemSortOrderPopupProps) => {
  if (!initialData) {
    console.error("No initialData for ChangeSortOrderPopup");
    return;
  }

  const [sortOrder, setSortOrder] = useState(initialData);

  const handleSortOptionSelected = (sortOptionArray: string[]) => {
    if (sortOptionArray.length < 1) {
      return;
    }
    const sortOption = sortOptionArray[0] as ListItemSortOption;
    setSortOrder(sortOption);
  };

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
        enumType="itemSortOptions"
        selected={[sortOrder]}
        onChange={handleSortOptionSelected}
      />
      <input type="hidden" value={sortOrder} name="sortOrder" id="sortOrder" />
    </form>
  );
};

interface TagsEditPopupProps {
  initialData: Tag[] | null;
  formRef: Ref<HTMLFormElement>;
  onSubmit: (formData: FormData) => void | Promise<void>;
}

export const TagsEditPopup = ({
  initialData,
  formRef,
  onSubmit,
}: TagsEditPopupProps) => {
  const [tags, setTags] = useState<EditableTag[]>(initialData ?? []);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColour, setNewTagColour] = useState("#000000");

  if (!initialData) {
    console.error("No initialData for TagsEditPopupProps");
    return null;
  }

  const addTag = () => {
    const name = newTagName.trim();

    if (!name) return;

    setTags((currentTags) => [
      ...currentTags,
      {
        name,
        colour: newTagColour,
      },
    ]);

    setNewTagName("");
    setNewTagColour("#000000");
  };

  const removeTag = (index: number) => {
    setTags((currentTags) =>
      currentTags.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const updateTagColour = (index: number, colour: string) => {
    setTags((currentTags) =>
      currentTags.map((tag, currentIndex) =>
        currentIndex === index ? { ...tag, colour } : tag,
      ),
    );
  };

  return (
    <form
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        formData.set("tags", JSON.stringify(tags));
        onSubmit(formData);
      }}
      className="text-gray-900 space-y-5"
    >
      <div className="w-full text-center bg-gray-200 rounded p-2">
        <h2 className="p-1 text-md font-bold">Add a tag</h2>

        <div className="flex flex-row justify-center items-center gap-4">
          <input
            type="color"
            value={newTagColour}
            onChange={(event) => setNewTagColour(event.target.value)}
            className="size-10 rounded-full"
          />

          <input
            type="text"
            value={newTagName}
            onChange={(event) => setNewTagName(event.target.value)}
            placeholder="Name"
            className="border-1 rounded p-1"
          />

          <button
            type="button"
            onClick={addTag}
            className="bg-blue-500 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2 px-4 rounded"
          >
            Add
          </button>
        </div>
      </div>

      <div className="w-full text-center bg-gray-200 rounded divide-y divide-gray-300 p-1">
        <h2 className="font-bold text-md p-1">Tags</h2>

        {tags.length > 0 ? (
          <ul className="p-1 text-sm space-y-1">
            {tags.map((tag, index) => (
              <li
                key={tag.id ?? `new-${index}`}
                className="flex flex-row justify-between items-center gap-4"
              >
                <input
                  type="color"
                  value={tag.colour}
                  onChange={(event) =>
                    updateTagColour(index, event.target.value)
                  }
                  className="size-10 rounded-full"
                />

                <span>{tag.name}</span>

                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold p-2 rounded"
                >
                  <Trash2Icon />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-1 text-gray-500">No tags</p>
        )}
      </div>
    </form>
  );
};
