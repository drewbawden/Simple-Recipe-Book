import { ReactNode } from "react";
import { formatDateParam, MealEvent } from "./calendar";
import { useDraggable, useDroppable } from "@dnd-kit/react";
import { RECIPE_COLORS } from "@/lib/meal-planner";

const getRecipeColor = (recipeId: number) => {
  let hash = recipeId;
  hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b);
  hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b);
  hash ^= hash >>> 16;
  return RECIPE_COLORS[(hash >>> 0) % RECIPE_COLORS.length];
};

export const CalendarDayDropZone = ({
  id,
  date,
  children,
}: {
  id: string;
  date: Date | null;
  children: ReactNode;
}) => {
  const dateValue = date ? formatDateParam(date) : null;
  const { ref, isDropTarget } = useDroppable({
    id: `calendar-day-${id}`,
    data: { date: dateValue },
    disabled: dateValue === null,
  });

  return (
    <div
      ref={ref}
      className={`relative h-full min-w-0 ${isDropTarget ? "ring-2 ring-inset ring-emerald-500" : ""}`}
    >
      {children}
    </div>
  );
};

export const DraggableMealSummary = ({
  meal,
  onClick,
}: {
  meal: MealEvent;
  onClick: (meal: MealEvent) => void;
}) => {
  const { ref, isDragging } = useDraggable({
    id: `meal-summary-${meal.id}`,
    data: { mealId: meal.id },
  });
  const recipeColor =
    meal.recipeId === null ? null : getRecipeColor(meal.recipeId);
  const title = meal.customText ?? meal.recipe?.name ?? "Meal";

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => {
        if (meal.recipeId !== null) onClick(meal);
      }}
      className={`flex h-full w-full items-center justify-between rounded border px-3 py-1.5 text-left text-xs font-medium sm:text-sm ${recipeColor?.row ?? "bg-gray-50 border-gray-200 text-gray-900"} ${isDragging ? "opacity-40" : ""}`}
      title={title}
      style={{ touchAction: "none" }}
    >
      <span>{title}</span>
      <span
        className={`text-[10px] sm:text-xs ${recipeColor?.date ?? "text-gray-700"}`}
      >
        {new Date(meal.startDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}{" "}
        -{" "}
        {new Date(meal.endDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </span>
    </button>
  );
};

export const DraggableMealBar = ({
  meal,
  weekIdx,
  mealIdx,
  startCol,
  endCol,
  onClick,
}: {
  meal: MealEvent;
  weekIdx: number;
  mealIdx: number;
  startCol: number;
  endCol: number;
  onClick: (meal: MealEvent) => void;
}) => {
  const { ref, isDragging } = useDraggable({
    id: `meal-bar-${meal.id}-${weekIdx}`,
    data: { mealId: meal.id },
  });
  const recipeColor =
    meal.recipeId === null ? null : getRecipeColor(meal.recipeId);
  const title = meal.customText ?? meal.recipe?.name ?? "Meal";

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => {
        if (meal.recipeId !== null) onClick(meal);
      }}
      aria-label={`Move ${title}`}
      className={`pointer-events-auto z-10 flex h-4 items-center overflow-hidden rounded px-1 text-left text-[8px] font-semibold sm:h-6 sm:px-2 sm:text-xs ${recipeColor?.bar ?? "bg-gray-300 text-gray-900"} ${recipeColor ? "text-white" : ""} ${isDragging ? "opacity-40" : ""}`}
      style={{
        gridColumn: `${startCol} / ${endCol}`,
        gridRow: mealIdx + 1,
        touchAction: "none",
      }}
      title={title}
    >
      <span className="truncate">{title}</span>
    </button>
  );
};
