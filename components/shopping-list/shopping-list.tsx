import {
  getShoppingList,
  setItemCompleted,
  deleteItem,
  addItemToList,
  getShoppingListGroupedByCategory,
} from "@/actions/shopping-lists";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ListItemCard } from "@/components/shopping-list/item-card";
import { categoryEnumToName, computeCategory } from "@/lib/category";
import { computeQuantity } from "@/lib/list-item";

export const ShoppingList = () => {
  const [loading, setLoading] = useState(true);
  const [shoppingList, setShoppingList] =
    useState<Awaited<ReturnType<typeof getShoppingList>>>(null);
  const [groupedList, setGroupedList] = useState<
    Awaited<ReturnType<typeof getShoppingListGroupedByCategory>>
  >([]);
  const deleteTimers = useRef<Record<number, NodeJS.Timeout | undefined>>({});
  const [inputValue, setInputValue] = useState("");

  const refreshData = async () => {
    const [nextList, nextGroupedList] = await Promise.all([
      getShoppingList(),
      getShoppingListGroupedByCategory(),
    ]);

    setShoppingList(nextList);
    setGroupedList(nextGroupedList);
  };

  const handleInputSubmit = async (productName: string) => {
    // TODO: Should weighting be biased above a certain threshold (~0.35) or linear?
    if (productName != "") {
      setInputValue("");
      const category = await computeCategory(productName);
      await addItemToList(productName, category);
      await refreshData();
    }
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
      <form
        action={async (formData) => {
          const productName = formData.get("productName") as string;
          handleInputSubmit(productName);
        }}
      >
        <input
          type="text"
          name="productName"
          id="productName"
          className="bg-gray-500 m-5 p-1"
          placeholder="enter item"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
          onBlur={(e) => {
            handleInputSubmit(e.target.value);
          }}
        />
        <input type="submit" hidden />
      </form>
      <Link
        href="/"
        className="bg-blue-500 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Recipes
      </Link>
      <h1 className="mb-6 text-4xl font-bold">{shoppingList.name}</h1>
      <hr className="h-0.5 bg-black pb-2" />
      <div className="space-y-2">
        {groupedList.map((category) => (
          <ul key={category.name} className="bg-gray-800 p-2 rounded space-y-2">
            <div className="flex">
              <h1 className="text-2xl text-left font-bold bg-black p-1 rounded">
                {categoryEnumToName(category.name)}
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
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
};
