import { getShoppingList, setItemCompleted, deleteItem } from '@/actions/shoppingList';
import { Prisma } from "@/app/generated/prisma/client";
import { NormalUnit } from '@/app/generated/prisma/enums'
import { useState, useEffect } from 'react';
import Link from 'next/link';


type ShoppingListWithItems = Prisma.ShoppingListGetPayload<{
  include: {
    items: {
      include: {
        item: true;
        shoppingListItemSources: {
          include: {
            recipeIngredient: true;
          };
        };
      };
    };
  };
}>;

export const ShoppingList = () => {
    const [loading, setLoading] = useState(true);
    const [list, setList] = useState<ShoppingListWithItems | null>(null);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const data = await getShoppingList();
        setList(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching shopping list items:', error);
        setLoading(false);
      }
    };

    fetchList();
  }, []);

  if (loading) {
    return <p>Loading Items...</p>
  }

  if (!list) {
    return <p>No shopping list found</p>
  }

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  async function handleItemChecked(id: number, e: React.ChangeEvent<HTMLInputElement>) {
    const completed = e.target.checked;

    setList((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
        item.id === id
            ? { ...item, completed }
            : item
        ),
    }));

    await setItemCompleted(id, e.target.checked)

    await sleep(1500); // wait 2 seconds
    if (e.target.checked) {
        await deleteItem(id);

        setList((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
        }));
    }
  }

  return (
    <div className="mx-auto max-w-xl p-6 flex flex-col text-center space-y-1">
      <Link href="/" className='bg-blue-500 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2 px-4 rounded mb-4'>Recipes</Link>
      <h1 className="mb-6 text-4xl font-bold">{list.name}</h1>
      <hr className='h-0.5 bg-black' />
      <div className="space-y-2">
        {list.items.map((listItem) => {
          const sources = listItem.shoppingListItemSources
          if (sources.length === 0) return null;

          let totalNormalQuantity = 0.00;
          let totalStandardQuantity = 0.00;
          let totalQuantity = 0.00;
          let units = new Set();
          let normalUnits = new Set();
          for (let i = 0; i < sources.length; i++) {
            const standardQuantity = Number(sources[i].recipeIngredient.standardQuantity) || 0;
            const normalQuantity = Number(sources[i].recipeIngredient.normalQuantity) || 0;
            if (standardQuantity === 0) {
              totalStandardQuantity += 1;
            }
            totalStandardQuantity += standardQuantity;
            totalNormalQuantity += normalQuantity;
            units.add(sources[i].recipeIngredient.unit);
            normalUnits.add(sources[i].recipeIngredient.normalUnit);
          }
          let totalUnit = '';
          if (normalUnits.size > 1) {
            totalUnit = 'mixed units';
          }
          else if (units.size > 1 && normalUnits.size === 1) {
            totalUnit = normalUnits.values().next().value.toLowerCase() + 's';
            totalQuantity = totalNormalQuantity;
          }
          else {
            totalUnit = units.values().next().value ?? '';

            totalQuantity = totalStandardQuantity
            const normalUnit = sources[0].recipeIngredient.normalUnit;
            if (normalUnit == NormalUnit.INDIVIDUAL && !totalUnit.endsWith('s') && totalStandardQuantity > 1) {
              totalUnit += 's';
            }
          }

          return (
            <label
              key={listItem.id}
              className="flex flex-col items-center justify-between rounded-lg border p-4 hover:bg-muted"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={listItem.completed}
                  onChange={(e) => handleItemChecked(listItem.id, e)}
                  className="h-5 w-5"
                />

                <span
                  className={
                    listItem.completed
                      ? "line-through text-muted-foreground"
                      : ""
                  }
                >
                  {listItem.customName ?? listItem.item.name}
                </span>
              <span className="text-sm text-muted-foreground">
                {totalUnit == 'mixed units' ? '' : totalQuantity}
                {totalUnit ? ` ${totalUnit}` : ""}
              </span>
              </div>

              <ul>
                {sources.map((source) => (
                  <li key={source.id}>{source.recipeIngredient.quantity} {source.recipeIngredient.unit}</li>
                ))}
              </ul>
            </label>
          );
        })}
      </div>
    </div>
  );
  }