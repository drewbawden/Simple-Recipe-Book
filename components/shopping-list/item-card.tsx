import { useState } from "react";
import { ChevronDown, SettingsIcon, Trash2Icon } from "lucide-react";
import { getShoppingList } from "@/actions/shopping-lists";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/templates/context-menu";

type ShoppingList = NonNullable<Awaited<ReturnType<typeof getShoppingList>>>;

type ListItem = ShoppingList["items"][number];

type Sources = ListItem["shoppingListItemSources"];

interface ListItemCardProps {
  listItem: ListItem;
  totalQuantity?: number;
  totalUnit?: string;
  sources?: Sources;
  handleItemChecked: (
    id: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => Promise<void>;
  handleItemDeleted: (id: number) => void;
}

export const ListItemCard = ({
  listItem,
  totalQuantity,
  totalUnit,
  sources,
  handleItemChecked,
  handleItemDeleted,
}: ListItemCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-2 rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:border-accent hover:shadow-md">
      <label className="flex items-center justify-between px-2 py-2">
        <div className="mx-1 flex items-center gap-3">
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
            {listItem.item.name}
          </label>
        </div>

        <div className="flex flex-row space-x-2">
          {sources && sources.length > 0 && (
            <label className="flex items-center border-1 border-gray-500 rounded">
              <span className="rounded-md bg-muted pl-2 py-1 text-xs font-semibold text-muted-foreground">
                {totalUnit === "mixed units" ? "" : totalQuantity}
                {totalUnit ? ` ${totalUnit}` : ""}
              </span>

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
            </label>
          )}
          <ContextMenu>
            <ContextMenuTrigger>
              <SettingsIcon />
            </ContextMenuTrigger>
            <ContextMenuContent align="right" className="text-gray-900">
              <ContextMenuItem onSelect={() => {}}>Edit</ContextMenuItem>
              <hr />
              <ContextMenuItem>Change Category</ContextMenuItem>
              <hr />
              <ContextMenuItem className="text-red-500">Delete</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      </label>

      {isOpen && sources && sources.length > 0 && (
        <div className="border-t bg-muted/40 px-4 py-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Needed for
          </p>
          <ul className="space-y-1.5 pl-2 text-sm text-muted-foreground">
            {sources.map((source) => (
              <li key={source.id} className="flex items-center justify-between">
                <span className="max-w-md">
                  {source.recipeIngredient.recipe.name || "Recipe Source"}
                </span>
                <span className="font-mono text-xs">
                  {source.recipeIngredient.quantity}{" "}
                  {source.recipeIngredient.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
