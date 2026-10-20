"use client";

import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import {
  DragDropManager,
  PointerActivationConstraints,
  PointerSensor,
} from "@dnd-kit/dom";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/templates/context-menu";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { deleteMeal, getMeals, moveMeal } from "@/actions/meal-planner";
import { Modal } from "../templates/modal";
import { useModalQuery } from "@/hooks/useModalQuery";
import { AddMealPopup } from "./popups/add-meal/add-meal";
import { Recipe } from "@/types/recipe";
import { getRecipes } from "@/actions/recipes";
import { normaliseRecipes } from "@/lib/recipes";
import { RecipeOverview } from "@/components/recipes/popups/overview";
import {
  CalendarDayDropZone,
  DraggableMealBar,
  DraggableMealSummary,
} from "./calendar-children";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_VISIBLE_MEALS_PER_ROW = 2;

export interface MealEvent {
  id: number;
  customText: string | null;
  recipeId: number | null;
  recipe: Pick<Recipe, "name"> | null;
  startDate: Date;
  endDate: Date;
}

const getDaysInMonth = (date: Date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const daysInMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();

  const dayOfWeek = (firstDay.getDay() + 6) % 7;

  return Array.from({ length: dayOfWeek + daysInMonth }, (_, index) =>
    index < dayOfWeek ? null : index - dayOfWeek + 1,
  );
};

const isSameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const parseDateParam = (value: string | null) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDateParam = (date: Date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDatesBetween = (startDate: Date, endDate: Date) => {
  const dates = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  const targetEnd = new Date(endDate);
  targetEnd.setHours(0, 0, 0, 0);

  while (current <= targetEnd) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

const shiftCalendarDate = (date: string, amount: number) => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + amount))
    .toISOString()
    .slice(0, 10);
};

const getCalendarDayNumber = (date: string) =>
  Date.parse(`${date}T00:00:00Z`) / 86_400_000;

export const MealPlannerCalendar = () => {
  const today = new Date();
  const [meals, setMeals] = useState<MealEvent[]>([]);
  const [recipeOverview, setRecipeOverview] = useState<Recipe | null>(null);
  const { modal, openModal, closeModal, getModalParam } = useModalQuery();
  const queryStartDate =
    modal === "addMeal" || modal === "editMeal"
      ? parseDateParam(getModalParam("startDate"))
      : null;
  const queryEndDate =
    modal === "addMeal" || modal === "editMeal"
      ? parseDateParam(getModalParam("endDate"))
      : null;
  const editingMealId =
    modal === "editMeal" ? Number(getModalParam("mealId")) : null;
  const [displayedMonth, setDisplayedMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDates, setSelectedDates] = useState<Date[] | null>(() =>
    queryStartDate && queryEndDate
      ? getDatesBetween(queryStartDate, queryEndDate)
      : null,
  );
  const rawDays = getDaysInMonth(displayedMonth);
  const mealAddForm = useRef<HTMLFormElement>(null);

  const [selectingDates, setSelectingDates] = useState(false);
  const [mealStartDate, setMealStartDate] = useState<Date | null>(
    queryStartDate,
  );
  const [mealEndDate, setMealEndDate] = useState<Date | null>(queryEndDate);
  const addingMeal = modal === "addMeal";
  const editingMeal = meals.find((meal) => meal.id === editingMealId) ?? null;

  const [calendarUrl, setCalendarUrl] = useState("");

  useEffect(() => {
    const url = new URL("/api/calendar/feed.ics", window.location.origin);
    setCalendarUrl(url.href.replace(/^https?:/, "webcal:"));
  }, []);

  const loadMeals = useCallback(async () => {
    const savedMeals = await getMeals();
    setMeals(
      savedMeals.map((m) => ({
        ...m,
        startDate: new Date(m.startDate),
        endDate: new Date(m.endDate),
      })),
    );
  }, []);

  const recipeOverviewId =
    modal === "recipeOverview" ? Number(getModalParam("recipeId")) : null;

  useEffect(() => {
    if (!recipeOverviewId || !Number.isInteger(recipeOverviewId)) {
      setRecipeOverview(null);
      return;
    }

    let cancelled = false;

    const loadRecipeOverview = async () => {
      try {
        const recipes = normaliseRecipes(await getRecipes());
        if (!cancelled) {
          setRecipeOverview(
            recipes.find((recipe) => recipe.id === recipeOverviewId) ?? null,
          );
        }
      } catch (error) {
        console.error("Failed to load recipe overview:", error);
        if (!cancelled) setRecipeOverview(null);
      }
    };

    void loadRecipeOverview();
    return () => {
      cancelled = true;
    };
  }, [modal, recipeOverviewId]);

  useEffect(() => {
    void loadMeals();
  }, [loadMeals]);

  useEffect(() => {
    const eventSource = new EventSource("/api/sse/events");

    eventSource.addEventListener("meals-updated", () => {
      void loadMeals();
    });

    return () => eventSource.close();
  }, [loadMeals]);

  const handleMealClick = async (meal: MealEvent) => {
    if (meal.recipeId === null) return;
    openModal("recipeOverview", { recipeId: meal.recipeId });
  };

  const handleMealDragEnd = async (event: DragEndEvent) => {
    if (event.canceled) return;

    const { source, target } = event.operation;
    const mealId = Number(source?.data.mealId);
    const targetDate = target?.data.date;
    if (!Number.isInteger(mealId) || typeof targetDate !== "string") return;

    const meal = meals.find((item) => item.id === mealId);
    if (!meal) return;

    const startDate = formatDateParam(meal.startDate);
    const endDate = formatDateParam(meal.endDate);
    const durationDays =
      getCalendarDayNumber(endDate) - getCalendarDayNumber(startDate);
    if (targetDate === startDate) return;

    try {
      await moveMeal({
        mealId,
        startDate: targetDate,
        endDate: shiftCalendarDate(targetDate, durationDays),
      });
      await loadMeals();
    } catch (error) {
      console.error("Failed to move meal:", error);
      await loadMeals();
    }
  };

  const changeMonth = (amount: number) => {
    setDisplayedMonth(
      (currentMonth) =>
        new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + amount,
          1,
        ),
    );
  };

  const monthLabel = displayedMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const selectedDate = selectedDates?.[0] ?? null;

  const selectedDayMeals = useMemo(() => {
    if (!selectedDate) return [];
    return meals.filter((m) => {
      const s = new Date(m.startDate);
      s.setHours(0, 0, 0, 0);
      const e = new Date(m.endDate);
      e.setHours(23, 59, 59, 999);
      const d = new Date(selectedDate);
      d.setHours(12, 0, 0, 0);
      return d >= s && d <= e;
    });
  }, [meals, selectedDate]);

  const dragDropManager = useMemo(
    () =>
      new DragDropManager({
        sensors: [
          PointerSensor.configure({
            activationConstraints: [
              new PointerActivationConstraints.Delay({
                value: 100,
                tolerance: 10,
              }),
            ],
          }),
        ],
      }),
    [],
  );

  const selectDatesBetween = (startDate: Date, endDate: Date) => {
    setSelectedDates(getDatesBetween(startDate, endDate));

    if (addingMeal) {
      openModal("addMeal", {
        startDate: formatDateParam(startDate),
        endDate: formatDateParam(endDate),
      });
    }
  };

  const handleDateClick = (date: Date, isBeforeMealStartDate: boolean) => {
    if (selectingDates && isBeforeMealStartDate) return;

    if (!selectingDates && selectedDate && isSameDay(date, selectedDate)) {
      setMealStartDate(date);
      setSelectingDates(true);
      return;
    } else if (selectingDates) {
      setMealEndDate(date);
      setSelectingDates(false);
      selectDatesBetween(mealStartDate!, date);
      openModal("addMeal", {
        startDate: formatDateParam(mealStartDate!),
        endDate: formatDateParam(date),
      });
      return;
    }
    setSelectedDates([date]);
  };

  const weeks = useMemo(() => {
    const totalDays = [...rawDays];
    while (totalDays.length % 7 !== 0) {
      totalDays.push(null);
    }

    const weekRows: (Date | null)[][] = [];
    for (let i = 0; i < totalDays.length; i += 7) {
      const slice = totalDays.slice(i, i + 7);
      weekRows.push(
        slice.map((day) =>
          day
            ? new Date(
                displayedMonth.getFullYear(),
                displayedMonth.getMonth(),
                day,
              )
            : null,
        ),
      );
    }
    return weekRows;
  }, [rawDays, displayedMonth]);

  return (
    <DragDropProvider
      manager={dragDropManager}
      onDragEnd={(event) => void handleMealDragEnd(event)}
    >
      <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-4 py-3 sm:px-6">
          <h1 className="text-xl font-bold text-gray-900 sm:text-3xl">
            {monthLabel}
          </h1>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                setDisplayedMonth(
                  new Date(today.getFullYear(), today.getMonth(), 1),
                )
              }
              className="mr-1 rounded border border-blue-600 bg-blue-500 px-2.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-3 sm:py-2 sm:text-sm"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              aria-label="Previous month"
              className="rounded p-1.5 text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:p-2"
            >
              <ChevronLeftIcon
                aria-hidden="true"
                className="size-4 sm:size-5"
              />
            </button>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              aria-label="Next month"
              className="rounded p-1.5 text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:p-2"
            >
              <ChevronRightIcon
                aria-hidden="true"
                className="size-4 sm:size-5"
              />
            </button>

            <ContextMenu>
              <ContextMenuTrigger className="p-1">
                <EllipsisVerticalIcon />
              </ContextMenuTrigger>

              <ContextMenuContent>
                {calendarUrl && (
                  <a href={calendarUrl} className="p-3 w-full">
                    Subscribe to ICS feed
                  </a>
                )}
              </ContextMenuContent>
            </ContextMenu>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-100 px-1 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-gray-600 sm:px-4 sm:text-xs">
          {WEEKDAYS.map((weekday) => (
            <div key={weekday}>{weekday}</div>
          ))}
        </div>

        <div className="flex flex-col gap-px bg-gray-200 p-px">
          {weeks.map((week, weekIdx) => {
            const validDays = week.filter((d): d is Date => d !== null);
            if (validDays.length === 0) return null;

            const weekStart = new Date(validDays[0]);
            weekStart.setHours(0, 0, 0, 0);

            const weekEnd = new Date(validDays[validDays.length - 1]);
            weekEnd.setHours(23, 59, 59, 999);

            const weekStartDay = getCalendarDayNumber(
              formatDateParam(weekStart),
            );
            const weekEndDay = getCalendarDayNumber(formatDateParam(weekEnd));
            const weekMeals = meals
              .filter((meal) => {
                const startDay = getCalendarDayNumber(
                  formatDateParam(meal.startDate),
                );
                const endDay = getCalendarDayNumber(
                  formatDateParam(meal.endDate),
                );
                return startDay <= weekEndDay && endDay >= weekStartDay;
              })
              .sort(
                (first, second) =>
                  getCalendarDayNumber(formatDateParam(first.startDate)) -
                    getCalendarDayNumber(formatDateParam(second.startDate)) ||
                  first.id - second.id,
              );

            const laneEndDays = Array<number>(MAX_VISIBLE_MEALS_PER_ROW).fill(
              Number.NEGATIVE_INFINITY,
            );
            const visibleMeals: { meal: MealEvent; lane: number }[] = [];
            const hiddenMealIds = new Set<number>();

            for (const meal of weekMeals) {
              const startDay = Math.max(
                weekStartDay,
                getCalendarDayNumber(formatDateParam(meal.startDate)),
              );
              const endDay = Math.min(
                weekEndDay,
                getCalendarDayNumber(formatDateParam(meal.endDate)),
              );
              const lane = laneEndDays.findIndex(
                (laneEndDay) => laneEndDay < startDay,
              );

              if (lane === -1) {
                hiddenMealIds.add(meal.id);
                continue;
              }

              laneEndDays[lane] = endDay;
              visibleMeals.push({ meal, lane });
            }

            return (
              <div
                key={weekIdx}
                className="relative grid grid-cols-7 gap-px min-h-[76px] sm:min-h-[120px]"
              >
                {week.map((date, dayIdx) => {
                  const isSelected =
                    date !== null &&
                    selectedDates?.some((selected) =>
                      isSameDay(date, selected),
                    );
                  const isToday = date !== null && isSameDay(date, today);
                  const isBeforeMealStartDate =
                    selectingDates &&
                    date !== null &&
                    mealStartDate !== null &&
                    date < mealStartDate;

                  const dayMeals = date
                    ? meals.filter((m) => {
                        const s = new Date(m.startDate);
                        s.setHours(0, 0, 0, 0);
                        const e = new Date(m.endDate);
                        e.setHours(23, 59, 59, 999);
                        const d = new Date(date);
                        d.setHours(12, 0, 0, 0);
                        return d >= s && d <= e;
                      })
                    : [];

                  const hiddenCount = dayMeals.filter((meal) =>
                    hiddenMealIds.has(meal.id),
                  ).length;

                  return (
                    <CalendarDayDropZone
                      key={date?.toISOString() ?? `empty-${weekIdx}-${dayIdx}`}
                      id={`${weekIdx}-${dayIdx}-${date ? formatDateParam(date) : "empty"}`}
                      date={date}
                    >
                      <button
                        type="button"
                        disabled={date === null}
                        onClick={() => {
                          date && handleDateClick(date, isBeforeMealStartDate);
                        }}
                        className={`flex h-full w-full flex-col justify-between p-1 text-left align-top transition sm:p-2
                        ${date === null ? "cursor-default opacity-45 bg-gray-50" : ""}
                        ${
                          isBeforeMealStartDate
                            ? "bg-gray-300"
                            : isSelected
                              ? "bg-blue-50 ring-2 ring-inset ring-blue-500"
                              : "bg-white"
                        }
                      `}
                      >
                        <div className="flex w-full items-center justify-between">
                          {date ? (
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold sm:h-7 sm:w-7 sm:text-sm ${
                                isToday
                                  ? "bg-blue-500 text-white"
                                  : "text-gray-900"
                              }`}
                            >
                              {date.getDate()}
                            </span>
                          ) : (
                            <span />
                          )}

                          {isSelected && (
                            <div>
                              {selectingDates ? (
                                <ArrowRightIcon className="size-3 text-gray-500 sm:size-4" />
                              ) : (
                                <PlusIcon className="size-3 text-gray-500 sm:size-4" />
                              )}
                            </div>
                          )}
                        </div>
                      </button>

                      {date && hiddenCount > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectingDates(false);
                            setSelectedDates([date]);
                          }}
                          aria-label={`Show ${hiddenCount} more meals on ${date.toLocaleDateString("en-US", { dateStyle: "long" })}`}
                          className="absolute right-0.5 top-6 z-20 max-w-[calc(100%-4px)] truncate rounded bg-white/90 px-0.5 text-right text-[8px] leading-3 font-semibold text-gray-600 shadow-sm hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 sm:top-auto sm:right-1 sm:bottom-1 sm:max-w-none sm:px-1 sm:text-xs sm:leading-normal"
                        >
                          +{hiddenCount} more
                        </button>
                      )}
                    </CalendarDayDropZone>
                  );
                })}

                <div className="pointer-events-none absolute inset-x-0 top-9 bottom-1 grid grid-cols-7 grid-rows-[repeat(2,16px)] gap-x-px gap-y-0.5 px-0.5 sm:top-10 sm:bottom-2 sm:grid-rows-[repeat(2,24px)] sm:gap-y-1">
                  {visibleMeals.map(({ meal, lane }) => {
                    let startCol = 1;
                    let endCol = 8;

                    week.forEach((date, idx) => {
                      if (!date) return;
                      if (isSameDay(date, meal.startDate)) {
                        startCol = idx + 1;
                      }
                      if (isSameDay(date, meal.endDate)) {
                        endCol = idx + 2;
                      }
                    });

                    if (new Date(meal.startDate) < weekStart) startCol = 1;
                    if (new Date(meal.endDate) > weekEnd) endCol = 8;

                    return (
                      <DraggableMealBar
                        key={meal.id}
                        meal={meal}
                        weekIdx={weekIdx}
                        mealIdx={lane}
                        startCol={startCol}
                        endCol={endCol}
                        onClick={handleMealClick}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-gray-200 px-4 py-3 sm:px-6">
          <p className="text-sm font-semibold text-gray-700">
            Selected:{" "}
            {selectedDate
              ? selectedDate.toLocaleDateString("en-US", { dateStyle: "long" })
              : "None"}
          </p>

          {selectedDate && (
            <div className="mt-2 flex flex-col gap-1.5">
              {selectedDayMeals.length > 0 ? (
                selectedDayMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex flex-row w-full justify-between items-center gap-2"
                  >
                    <DraggableMealSummary
                      meal={meal}
                      onClick={handleMealClick}
                    />
                    <button
                      type="button"
                      aria-label={`Edit ${meal.customText ?? meal.recipe?.name ?? "meal"}`}
                      className="rounded border border-gray-200 bg-white p-1.5 text-gray-600 shadow-sm hover:bg-gray-100"
                      onClick={() =>
                        openModal("editMeal", {
                          mealId: meal.id,
                          startDate: formatDateParam(meal.startDate),
                          endDate: formatDateParam(meal.endDate),
                        })
                      }
                    >
                      <PencilIcon size={20} />
                    </button>
                    <Trash2Icon
                      className="text-red-400 bg-red-100 rounded p-1.5 border border-red-200 shadow-sm active:bg-red-500"
                      size={32}
                      onClick={() => {
                        deleteMeal(meal.id);
                      }}
                    />
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">
                  No meals scheduled for this day.
                </p>
              )}
            </div>
          )}
        </div>

        <Modal
          isOpen={addingMeal || (modal === "editMeal" && editingMeal !== null)}
          onClose={() => {
            setSelectedDates([]);
            closeModal();
          }}
          modalTitle={editingMeal ? "Edit Meal" : "Add Meal"}
          showTick
          handleTick={() => {
            const form = mealAddForm.current;
            if (!form?.reportValidity()) {
              return false;
            }

            form.requestSubmit();
            if (
              form.querySelector<HTMLInputElement>(
                'input[name="addToShoppingList"]',
              )?.checked
            ) {
              return false;
            }
            return true;
          }}
          confirmClose
          size="xxl"
        >
          {(addingMeal || editingMeal) && (
            <AddMealPopup
              key={editingMeal?.id ?? "add-meal"}
              formRef={mealAddForm}
              onMealAdded={async () => {
                await loadMeals();
                closeModal();
              }}
              startDate={
                editingMeal
                  ? (queryStartDate ?? editingMeal.startDate)
                  : mealStartDate
              }
              setStartDate={(date) => {
                if (editingMeal && date) {
                  openModal("editMeal", {
                    mealId: editingMeal.id,
                    startDate: formatDateParam(date),
                    endDate: formatDateParam(
                      queryEndDate ?? editingMeal.endDate,
                    ),
                  });
                  setSelectedDates(
                    getDatesBetween(date, queryEndDate ?? editingMeal.endDate),
                  );
                } else {
                  setMealStartDate(date);
                }
              }}
              endDate={
                editingMeal
                  ? (queryEndDate ?? editingMeal.endDate)
                  : mealEndDate
              }
              setEndDate={(date) => {
                if (editingMeal && date) {
                  openModal("editMeal", {
                    mealId: editingMeal.id,
                    startDate: formatDateParam(
                      queryStartDate ?? editingMeal.startDate,
                    ),
                    endDate: formatDateParam(date),
                  });
                  setSelectedDates(
                    getDatesBetween(
                      queryStartDate ?? editingMeal.startDate,
                      date,
                    ),
                  );
                } else {
                  setMealEndDate(date);
                }
              }}
              updateHighlights={selectDatesBetween}
              initialMeal={editingMeal}
            />
          )}
        </Modal>
        <Modal
          isOpen={modal === "recipeOverview" && recipeOverview !== null}
          onClose={closeModal}
          modalTitle="Recipe Overview"
          size="pfull"
        >
          {recipeOverview && <RecipeOverview recipe={recipeOverview} />}
        </Modal>
      </div>
    </DragDropProvider>
  );
};
