import {
  getShoppingList,
  setItemCompleted,
  deleteItem,
  getShoppingListGroupedByCategory,
  clearShoppingList,
  editListItem,
  updateCategorySortOrder,
  updateItemSortOrder,
} from "@/actions/shopping-lists";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/templates/context-menu";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ListItemCard } from "@/components/shopping-list/item-card";
import { computeQuantity } from "@/lib/shopping-list";
import { ShoppingListItemInput } from "@/components/shopping-list/item-input";
import { SettingsIcon, XIcon } from "lucide-react";
import { Modal } from "@/components/templates/modal";
import { ItemEditPopup } from "@/components/shopping-list/popups/item-edit";
import { listItem } from "@/types/list-item";
import {
  CategorySortOrderPopup,
  EditInfoPopup,
  ItemSortOrderPopup,
  TagsEditPopup,
} from "./popups/list-edit";
import {
  ListItemSortOption,
  ShoppingListSortOption,
} from "@/app/generated/prisma/enums";
import { updateCategoryIndices } from "@/actions/items";

export const ShoppingList = () => {
  const [loading, setLoading] = useState(true);
  const [shoppingList, setShoppingList] =
    useState<Awaited<ReturnType<typeof getShoppingList>>>(null);
  const [groupedList, setGroupedList] = useState<
    Awaited<ReturnType<typeof getShoppingListGroupedByCategory>>
  >([]);
  const [addToCategory, setAddToCategory] = useState<string | null>(null);

  const [editItem, setEditItem] = useState<listItem | null>(null);
  const [editList, setEditList] = useState(false);
  const [editCategorySortOrder, setEditCategorySortOrder] = useState(false);
  const [editItemSortOrder, setEditItemSortOrder] = useState(false);
  const [editTags, setEditTags] = useState(false);
  const itemEditFormRef = useRef<HTMLFormElement>(null);
  const listEditFormRef = useRef<HTMLFormElement>(null);
  const categorySortEditFormRef = useRef<HTMLFormElement>(null);
  const itemSortEditFormRef = useRef<HTMLFormElement>(null);
  const tagEditFormRef = useRef<HTMLFormElement>(null);

  const deleteTimers = useRef<Record<number, NodeJS.Timeout | undefined>>({});
  const deleteTokens = useRef<Record<number, number>>({});

  const refreshData = async () => {
    const [nextList, nextGroupedList] = await Promise.all([
      getShoppingList(),
      getShoppingListGroupedByCategory(),
    ]);

    setShoppingList(nextList);
    setGroupedList(nextGroupedList);
  };

  useEffect(() => {
    const fetchList = async () => {
      try {
        const [nextList, nextGroupedList] = await Promise.all([
          getShoppingList(),
          getShoppingListGroupedByCategory(),
        ]);

        setShoppingList(nextList);
        setGroupedList(nextGroupedList);
      } catch (error) {
        console.error("Error fetching shopping list items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, []);

  if (loading) {
    return <p>Loading Items...</p>;
  }

  if (!shoppingList) {
    return <p>No shopping list found</p>;
  }

  const cancelPendingDelete = (id: number) => {
    if (deleteTimers.current[id]) {
      clearTimeout(deleteTimers.current[id]);
      deleteTimers.current[id] = undefined;
    }

    deleteTokens.current[id] = (deleteTokens.current[id] ?? 0) + 1;
  };

  const handleItemDeleted = async (id: number) => {
    console.log("delete item");
    cancelPendingDelete(id);

    await deleteItem(id);

    setShoppingList((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
      };
    });

    setGroupedList((prev) =>
      prev
        .map((category) => ({
          ...category,
          items: category.items.filter((item) => item.id !== id),
        }))
        .filter((category) => category.items.length > 0),
    );

    await refreshData();
  };

  const handleItemChecked = async (
    id: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const completed = e.target.checked;
    const token = (deleteTokens.current[id] ?? 0) + 1;
    deleteTokens.current[id] = token;

    if (!completed) {
      cancelPendingDelete(id);
    }

    setShoppingList((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        items: prev.items.map((item) =>
          item.id === id ? { ...item, completed } : item,
        ),
      };
    });

    setGroupedList((prev) =>
      prev.map((category) => ({
        ...category,
        items: category.items.map((item) =>
          item.id === id ? { ...item, completed } : item,
        ),
      })),
    );

    await setItemCompleted(id, completed);

    if (deleteTokens.current[id] !== token) {
      return;
    }

    if (!completed) {
      return;
    }

    deleteTimers.current[id] = setTimeout(async () => {
      if (deleteTokens.current[id] !== token) {
        return;
      }

      try {
        await deleteItem(id);

        setShoppingList((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            items: prev.items.filter((item) => item.id !== id),
          };
        });

        setGroupedList((prev) =>
          prev
            .map((category) => ({
              ...category,
              items: category.items.filter((item) => item.id !== id),
            }))
            .filter((category) => category.items.length > 0),
        );
      } finally {
        deleteTimers.current[id] = undefined;
      }
    }, 1500);
  };

  const handleItemEditSubmit = async (formData: FormData) => {
    const value = (entry: FormDataEntryValue | null) =>
      typeof entry === "string" ? entry : entry == null ? "" : String(entry);

    const fields = {
      id: Number(formData.get("id")),
      name: value(formData.get("name")),
      notes: value(formData.get("notes")),
      url: value(formData.get("url")),
      urgent: formData.get("urgent") === "on",
      categorySlug: value(formData.get("categorySlug")),
    };

    await editListItem(fields);
    setEditItem(null);
    await refreshData();
  };

  const handleCategorySortSubmit = async (formData: FormData) => {
    const order = formData.get("sortOrder") as ShoppingListSortOption;
    const categoryOrder = JSON.parse(formData.get("categoryOrder") as string);
    await updateCategorySortOrder(shoppingList.id, order);
    await updateCategoryIndices(categoryOrder);

    setEditCategorySortOrder(false);
    await refreshData();
  };

  const handleItemSortSubmit = async (formData: FormData) => {
    const order = formData.get("sortOrder") as ListItemSortOption;
    await updateItemSortOrder(shoppingList.id, order);

    setEditItemSortOrder(false);
    await refreshData();
  };

  const handleTagEditSubmit = async () => {};

  return (
    <div className="mx-auto max-w-xl p-6 flex flex-col text-center space-y-1">
      <Link
        href="/"
        className="bg-blue-500 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Recipes
      </Link>
      <h1 className="mb-6 text-4xl font-bold">{shoppingList.name}</h1>
      <hr className="h-0.5 bg-black pb-2" />
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-2">
        <button
          className="bg-gray-500 w-fit p-2 rounded font-bold justify-self-start"
          onClick={async () => {
            await clearShoppingList();
            refreshData();
          }}
        >
          Clear List
        </button>
        <span className="bg-gray-500 p-2 rounded italic text-gray-300 justify-self-center">
          {shoppingList.items.length} Item
          {shoppingList.items.length != 1 && "s"}
        </span>
        <div className="justify-self-end">
          <ContextMenu>
            <ContextMenuTrigger>
              <SettingsIcon />
            </ContextMenuTrigger>
            <ContextMenuContent align="right" className="text-gray-900 w-50">
              <ContextMenuItem
                onSelect={() => {
                  setEditList(true);
                }}
              >
                Edit List Info
              </ContextMenuItem>
              <hr />
              <ContextMenuItem
                onSelect={() => {
                  setEditCategorySortOrder(true);
                }}
              >
                Sort Categories
              </ContextMenuItem>
              <hr />
              <ContextMenuItem
                onSelect={() => {
                  setEditItemSortOrder(true);
                }}
              >
                Sort Items
              </ContextMenuItem>
              <hr />
              <ContextMenuItem
                onSelect={() => {
                  setEditTags(true);
                }}
              >
                Edit Tags
              </ContextMenuItem>
              <hr />
              <ContextMenuItem className="text-red-500" onSelect={() => {}}>
                Delete List
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      </div>
      <hr className="h-0.5 bg-black pb-2" />
      <ShoppingListItemInput refreshData={refreshData} />
      <div className="space-y-2 my-4">
        {groupedList.map((category) => (
          <ul key={category.slug} className="bg-gray-800 p-2 rounded space-y-2">
            <div className="flex">
              <h1 className="bg-black p-1 rounded w-full flex justify-between gap-2 items-center">
                <span className="text-2xl font-bold ">
                  {category.displayName ?? category.slug}
                </span>
                <span className="text-md italic">
                  ({category.items.length})
                </span>
              </h1>
            </div>
            {category.items.map((listItem) => (
              <li key={listItem.id}>
                <ListItemCard
                  listItem={listItem}
                  totalQuantity={
                    computeQuantity(listItem.shoppingListItemSources)
                      .totalQuantity
                  }
                  totalUnit={
                    computeQuantity(listItem.shoppingListItemSources).totalUnit
                  }
                  sources={listItem.shoppingListItemSources}
                  handleItemChecked={handleItemChecked}
                  handleItemDeleted={handleItemDeleted}
                  setItemEdit={() =>
                    setEditItem({
                      id: listItem.id,
                      name: listItem.item.name,
                      notes: listItem.notes ?? undefined,
                      url: listItem.url ?? undefined,
                      urgent: listItem.urgent,
                      categorySlug: listItem.item.category?.slug,
                    })
                  }
                />
              </li>
            ))}
            {addToCategory == category.slug ? (
              <div className="flex flex-row justify-center space-x-1">
                <ShoppingListItemInput
                  refreshData={refreshData}
                  onEnter={() => setAddToCategory(null)}
                  categoryName={category.slug}
                  autoFocus={true}
                />
                <button
                  className="text-red-400 p-1 my-auto border-1 rounded-4xl h-1/2 border-red-400"
                  onClick={() => setAddToCategory(null)}
                >
                  <XIcon />
                </button>
              </div>
            ) : (
              <button
                className="bg-gray-400 text-2xl rounded px-10 py-1 w-full"
                onClick={() => setAddToCategory(category.slug)}
              >
                +
              </button>
            )}
          </ul>
        ))}
      </div>
      <Modal
        isOpen={editItem !== null}
        onClose={() => setEditItem(null)}
        size="md"
        modalTitle="Edit Item"
        showTick
        handleTick={() => itemEditFormRef.current?.requestSubmit()}
      >
        <ItemEditPopup
          initialData={editItem}
          formRef={itemEditFormRef}
          onSubmit={handleItemEditSubmit}
        />
      </Modal>
      <Modal
        isOpen={editList}
        onClose={() => setEditList(false)}
        size="md"
        modalTitle="Edit Shopping List"
        showTick
        handleTick={() => listEditFormRef.current?.requestSubmit()}
      >
        <EditInfoPopup
          initialData={shoppingList}
          formRef={listEditFormRef}
          onSubmit={() => {}}
        />
      </Modal>
      <Modal
        isOpen={editCategorySortOrder}
        onClose={() => setEditCategorySortOrder(false)}
        size="md"
        modalTitle="Sort Categories"
        showTick
        handleTick={() => categorySortEditFormRef.current?.requestSubmit()}
      >
        <CategorySortOrderPopup
          initialData={shoppingList.categorySortOrder}
          formRef={categorySortEditFormRef}
          onSubmit={handleCategorySortSubmit}
        />
      </Modal>
      <Modal
        isOpen={editItemSortOrder}
        onClose={() => setEditItemSortOrder(false)}
        size="md"
        modalTitle="Sort Items"
        showTick
        handleTick={() => itemSortEditFormRef.current?.requestSubmit()}
      >
        <ItemSortOrderPopup
          initialData={shoppingList.itemSortOrder}
          formRef={itemSortEditFormRef}
          onSubmit={handleItemSortSubmit}
        />
      </Modal>
      <Modal
        isOpen={editTags}
        onClose={() => setEditTags(false)}
        size="md"
        modalTitle="Edit Tags"
        showTick
        handleTick={() => tagEditFormRef.current?.requestSubmit()}
      >
        <TagsEditPopup
          initialData={shoppingList.tags}
          formRef={itemSortEditFormRef}
          onSubmit={handleItemSortSubmit}
        />
      </Modal>
    </div>
  );
};
