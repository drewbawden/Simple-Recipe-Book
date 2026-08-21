import {
  getShoppingList,
  setItemCompleted,
  deleteItem,
  getShoppingListGroupedByCategory,
  clearShoppingList,
} from "@/actions/shopping-lists";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ListItemCard } from "@/components/shopping-list/item-card";
import { computeQuantity } from "@/lib/shopping-list";
import { ShoppingListItemInput } from "@/components/shopping-list/item-input";
import { XIcon } from "lucide-react";
import { Modal } from "@/components/templates/modal";
import { ItemEditPopup } from "@/components/shopping-list/popups/item-edit";

export const ShoppingList = () => {
  const [loading, setLoading] = useState(true);
  const [shoppingList, setShoppingList] =
    useState<Awaited<ReturnType<typeof getShoppingList>>>(null);
  const [groupedList, setGroupedList] = useState<
    Awaited<ReturnType<typeof getShoppingListGroupedByCategory>>
  >([]);
  const [addToCategory, setAddToCategory] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<number | null>(null);

  const deleteTimers = useRef<Record<number, NodeJS.Timeout | undefined>>({});

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
  };

  const handleItemDeleted = async (id: number) => {
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

    if (completed) {
      deleteTimers.current[id] = setTimeout(async () => {
        try {
          await deleteItem(id);
        } finally {
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

          deleteTimers.current[id] = undefined;
        }
      }, 1500);
    }
  };

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
      <button
        className="bg-red-400 w-fit p-2"
        onClick={async () => {
          await clearShoppingList();
          refreshData();
        }}
      >
        Clear List
      </button>
      <hr className="h-0.5 bg-black pb-2" />
      <ShoppingListItemInput refreshData={refreshData} />
      <div className="space-y-2">
        {groupedList.map((category) => (
          <ul key={category.slug} className="bg-gray-800 p-2 rounded space-y-2">
            <div className="flex">
              <h1 className="text-2xl text-left font-bold bg-black p-1 rounded">
                {category.displayName ?? category.slug}
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
                  setItemEdit={setEditItem}
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
                className="bg-gray-400 text-2xl rounded px-10 py-1"
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
      >
        <ItemEditPopup />
      </Modal>
    </div>
  );
};
