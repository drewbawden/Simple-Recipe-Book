import { getShoppingList, setItemCompleted, deleteItem } from '@/actions/shoppingList';
import { Prisma } from "@/app/generated/prisma/client";
import { NormalUnit } from '@/app/generated/prisma/enums'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';


type ShoppingListWithItems = Prisma.ShoppingListGetPayload<{
  include: {
    items: {
      include: {
        item: true;
        shoppingListItemSources: {
          include: {
            recipeIngredient: {
              include: {
                recipe: true,
              }
            }
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

    setList((prev) => {
      if(!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) =>
        item.id === id
            ? { ...item, completed }
            : item
        ),
      }
    });

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
          let standardUnits = new Set();
          let normalUnits = new Set();
          let stringUnits = new Set();
          for (let i = 0; i < sources.length; i++) {
            const standardQuantity = Number(sources[i].recipeIngredient.standardQuantity) || 0;
            const normalQuantity = Number(sources[i].recipeIngredient.normalQuantity) || 0;
            totalStandardQuantity += standardQuantity;
            totalNormalQuantity += normalQuantity;
            standardUnits.add(sources[i].recipeIngredient.standardUnit);
            normalUnits.add(sources[i].recipeIngredient.normalUnit);
            stringUnits.add(sources[i].recipeIngredient.unit);
          }
          let totalUnit = '';
          const firstNormal = Array.from(normalUnits)[0];
          const firstStandard = Array.from(standardUnits)[0];
          const firstString = Array.from(stringUnits)[0];
          // more than one normal unit
          if (normalUnits.size > 1) {
            totalUnit = 'mixed units';
          }
          // one normal unit, but multiple standards
          else if (standardUnits.size > 1 && normalUnits.size === 1) {
            totalUnit = firstNormal?.toLowerCase() + 's';
            totalQuantity = totalNormalQuantity;
          }
          // one standard, but multiple strings
          else if (stringUnits.size > 1 && standardUnits.size === 1) {
            totalUnit = firstStandard?.toLowerCase() + 's';
            totalQuantity = totalStandardQuantity;
          }
          // multiple individual units
          else if (firstNormal === NormalUnit.INDIVIDUAL) {
            totalUnit = firstString?.toLowerCase();

            totalQuantity = totalStandardQuantity
            if (!totalUnit.endsWith('s') && totalStandardQuantity > 1) {
              totalUnit += 's';
            }
          }
          // no normal or standard units
          else {
            totalQuantity = totalStandardQuantity;
          }

          return (
          <ListItemCard key={listItem.id} listItem={listItem} totalQuantity={totalQuantity} totalUnit={totalUnit} sources={sources} handleItemChecked={handleItemChecked}/>
          );
        })}
      </div>
    </div>
  );
  }

function ListItemCard({ listItem, totalQuantity, totalUnit, sources, handleItemChecked }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-3 rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:border-accent hover:shadow-md">
      <label className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id={`item-${listItem.id}`}
            checked={listItem.completed}
            onChange={(e) => handleItemChecked(listItem.id, e)}
            className="h-5 w-5 rounded border-muted-foreground/30 text-primary focus:ring-primary cursor-pointer accent-primary"
          />

          <label
            htmlFor={`item-${listItem.id}`}
            className={`font-medium cursor-pointer select-none ${
              listItem.completed
                ? "line-through text-muted-foreground opacity-70"
                : "text-foreground"
            }`}
          >
            {listItem.customName ?? listItem.item.name}
          </label>
        </div>

        <label className="flex items-center gap-4 border-1 border-gray-500 rounded">
          <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            {totalUnit === "mixed units" ? "" : totalQuantity}
            {totalUnit ? ` ${totalUnit}` : ""}
          </span>

          {sources && sources.length > 0 && (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-md p-1 hover:bg-muted text-muted-foreground transition-colors"
              aria-expanded={isOpen}
              aria-label="Toggle ingredients"
            >
              <ChevronDown
                className={`h-5 w-5 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
        </label>
      </label>

      {isOpen && sources && sources.length > 0 && (
        <div className="border-t bg-muted/40 px-4 py-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Needed for
          </p>
          <ul className="space-y-1.5 pl-2 text-sm text-muted-foreground">
            {sources.map((source) => (
              <li key={source.id} className="flex items-center justify-between">
                <span>{source.recipeIngredient.recipe.name || "Recipe Source"}</span>
                <span className="font-mono text-xs">
                  {source.recipeIngredient.quantity} {source.recipeIngredient.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}