import { Recipe } from "@/types/recipe";
import Image from "next/image";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/templates/context-menu";
import Link from "next/link";
import { CrossIcon, PlusIcon, XIcon } from "lucide-react";

interface MealRecipeTileProps {
  recipe: Recipe;
  openOverview: (recipe: Recipe) => void;
  selectedRecipe: number | null;
  onSelect: (recipeId: number | null) => void;
}
export const MealRecipeTile = ({
  recipe,
  openOverview,
  selectedRecipe,
  onSelect,
}: MealRecipeTileProps) => {
  if (selectedRecipe !== null && selectedRecipe !== recipe.id) return;

  return (
    <div
      role="button"
      key={recipe.id}
      className="overflow-visible flex flex-row text-gray-900 p-4 border border-gray-300 rounded shadow-sm bg-white space-x-4"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return;
        }

        openOverview(recipe);
      }}
    >
      {recipe.imagePath ? (
        <div className="w-1/3 relative aspect-[16/9] bg-gray-100 overflow-hidden rounded-lg">
          <Image
            src={recipe.imagePath}
            alt={recipe.name}
            fill
            className="z-5 object-cover"
            sizes="(max-width: 768px) 100vw,
                         (max-width: 1200px) 50vw,
                         33vw"
          />
        </div>
      ) : null}
      <div className="relative w-full space-y-1 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <ContextMenu>
            <ContextMenuTrigger className="text-left bg-gray-100 rounded px-2 py-1 block overflow-hidden">
              <span className="line-clamp-3 font-bold" title={recipe.name}>
                {recipe.name}
              </span>
            </ContextMenuTrigger>

            <ContextMenuContent className="z-50 w-72">
              <div className="p-3">
                <p className="font-bold mb-2 text-gray-900">{recipe.name}</p>

                {recipe.url ? (
                  <Link
                    href={recipe.url}
                    target="_blank"
                    className="text-sm text-blue-600 underline break-all"
                  >
                    {recipe.url}
                  </Link>
                ) : (
                  <p className="text-sm text-gray-500">No URL</p>
                )}
              </div>
            </ContextMenuContent>
          </ContextMenu>
          <span className="text-sm bg-gray-100 px-2 py-1 rounded ml-2">
            {recipe.types.join(", ") || "---"}
          </span>
        </div>
        <div className="flex flex-row items-center justify-between">
          <div className="flex gap-4 text-sm text-gray-600">
            {recipe.servingSize ? (
              <span>{recipe.servingSize} servings</span>
            ) : null}
            {recipe.totalTimeMins ? (
              <span>{recipe.totalTimeMins} mins</span>
            ) : null}
          </div>
          {selectedRecipe === recipe.id ? (
            <button
              type="button"
              className="bg-red-100 p-1 rounded border border-red-200 shadow-sm"
              onClick={() => {
                onSelect(null);
              }}
            >
              <XIcon className="text-red-600" size={28} />
            </button>
          ) : (
            <button
              type="button"
              className="bg-blue-100 p-1 rounded border border-blue-200 shadow-sm"
              onClick={() => {
                onSelect(recipe.id);
              }}
            >
              <PlusIcon className="text-blue-600" size={28} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
