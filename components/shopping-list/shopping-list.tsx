import {
  getShoppingList,
  setItemCompleted,
  deleteItem,
  getShoppingListCategories,
  addItemToList,
} from "@/actions/shopping-lists";
import { NormalUnit } from "@/app/generated/prisma/enums";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ListItemCard } from "@/components/shopping-list/item-card";
import { categoryEnumToName, computeCategory } from "@/lib/category";

export const ShoppingList = () => {
  const [loading, setLoading] = useState(true);
  const [list, setList] =
    useState<Awaited<ReturnType<typeof getShoppingList>>>(null);
  const deleteTimers = useRef<Record<number, NodeJS.Timeout | undefined>>({});
  const [inputValue, setInputValue] = useState("");
  const [categories, setCategories] =
    useState<Awaited<ReturnType<typeof getShoppingListCategories>>>(null);

  const handleInputSubmit = async (productName: string) => {
    // TODO: Should weighting be biased above a certain threshold (~0.35) or linear?
    if (productName != "") {
      setInputValue("");
      const category = await computeCategory(productName);
      addItemToList(productName, category);
      refreshData();
    }
  };

  useEffect(() => {
    const fetchList = async () => {
      try {
        const data = await getShoppingList();
        setList(data);
      } catch (error) {
        console.error("Error fetching shopping list items:", error);
      }
    };

    fetchList();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getShoppingListCategories();
        setCategories(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching shopping list items:", error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <p>Loading Items...</p>;
  }

  if (!list) {
    return <p>No shopping list found</p>;
  }

  const refreshData = async () => {
    const list = await getShoppingList();
    const categories = await getShoppingListCategories();
    setList(list);
    setCategories(categories);
  };

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  async function handleItemChecked(
    id: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const completed = e.target.checked;

    if (!completed && deleteTimers.current[id]) {
      clearTimeout(deleteTimers.current[id]);
      deleteTimers.current[id] = undefined;
    }

    setList((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        items: prev.items.map((item) =>
          item.id === id ? { ...item, completed } : item,
        ),
      };
    });

    await setItemCompleted(id, completed);

    if (completed) {
      deleteTimers.current[id] = setTimeout(async () => {
        await deleteItem(id);

        setList((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            items: prev.items.filter((item) => item.id !== id),
          };
        });

        deleteTimers.current[id] = undefined;
      }, 1500);
    }
  }

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
      <h1 className="mb-6 text-4xl font-bold">{list.name}</h1>
      <hr className="h-0.5 bg-black pb-2" />
      <div className="space-y-2">
        {categories.map((category) => {
          return (
            <ul>
              <h1 className="text-2xl">{categoryEnumToName(category.name)}</h1>
              {category.items.map((item) => {
                return <li>{item.name}</li>;
              })}
            </ul>
          );
        })}
        {list.items.map((listItem) => {
          const sources = listItem.shoppingListItemSources;
          if (sources.length === 0) return null;

          let totalNormalQuantity = 0.0;
          let totalStandardQuantity = 0.0;
          let totalQuantity = 0.0;
          const standardUnits = new Set<string>();
          const normalUnits = new Set<string>();
          const stringUnits = new Set<string>();
          for (let i = 0; i < sources.length; i++) {
            const standardQuantity = sources[i].recipeIngredient
              .standardQuantity
              ? Number(sources[i].recipeIngredient.standardQuantity)
              : null;
            const normalQuantity = sources[i].recipeIngredient.normalQuantity
              ? Number(sources[i].recipeIngredient.normalQuantity)
              : null;
            if (standardQuantity) {
              totalStandardQuantity += standardQuantity;
            }
            if (normalQuantity) {
              totalNormalQuantity += normalQuantity;
            }

            const standardUnit = sources[i].recipeIngredient.standardUnit;
            const normalUnit = sources[i].recipeIngredient.normalUnit;
            const unit = sources[i].recipeIngredient.unit;
            if (standardUnit) {
              standardUnits.add(standardUnit);
            }
            if (normalUnit) {
              normalUnits.add(normalUnit);
            }
            if (unit) {
              stringUnits.add(unit);
            }
          }
          let totalUnit = "";
          const firstNormal = Array.from(normalUnits)[0];
          const firstStandard = Array.from(standardUnits)[0];
          const firstString = Array.from(stringUnits)[0];
          // more than one normal unit
          if (normalUnits.size > 1) {
            totalUnit = "mixed units";
          }
          // no normal or standard units
          else if (firstStandard === null) {
            totalQuantity = totalStandardQuantity;
          }
          // one normal unit, but multiple standards
          else if (standardUnits.size > 1 && normalUnits.size === 1) {
            totalUnit = firstNormal?.toLowerCase() + "s";
            totalQuantity = totalNormalQuantity;
          }
          // one standard, but multiple strings
          else if (stringUnits.size > 1 && standardUnits.size === 1) {
            totalUnit = firstStandard?.toLowerCase() + "s";
            totalQuantity = totalStandardQuantity;
          }
          // multiple individual units
          else if (firstNormal === NormalUnit.INDIVIDUAL) {
            totalUnit = firstString?.toLowerCase();

            totalQuantity = totalStandardQuantity;
            if (!totalUnit.endsWith("s") && totalStandardQuantity > 1) {
              totalUnit += "s";
            }
          }
          // one standard and normal unit
          else if (normalUnits.size === 1 && standardUnits.size === 1) {
            totalQuantity = totalStandardQuantity;
            totalUnit = firstStandard?.toLowerCase() + "s";
          }

          return (
            <ListItemCard
              key={listItem.id}
              listItem={listItem}
              totalQuantity={totalQuantity}
              totalUnit={totalUnit}
              sources={sources}
              handleItemChecked={handleItemChecked}
            />
          );
        })}
      </div>
    </div>
  );
};
