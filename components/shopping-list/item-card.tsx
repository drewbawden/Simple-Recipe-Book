import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export const ListItemCard = ({
  listItem,
  totalQuantity,
  totalUnit,
  sources,
  handleItemChecked,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-3 rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:border-accent hover:shadow-md">
      <label className="flex items-center justify-between p-4">
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
