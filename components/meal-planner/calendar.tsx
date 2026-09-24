"use client";

import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getMeals } from "@/actions/meal-planner";
import { Modal } from "../templates/modal";
import { useModalQuery } from "@/hooks/useModalQuery";
import { AddMealPopup } from "./popups/add-meal";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_VISIBLE_MEALS_PER_ROW = 2;

export interface MealEvent {
  id: number;
  customText: string | null;
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

const formatDateParam = (date: Date) => {
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

export const MealPlannerCalendar = () => {
  const today = new Date();
  const [meals, setMeals] = useState<MealEvent[]>([]);
  const { modal, openModal, closeModal, getModalParam } = useModalQuery();
  const queryStartDate =
    modal === "addMeal" ? parseDateParam(getModalParam("startDate")) : null;
  const queryEndDate =
    modal === "addMeal" ? parseDateParam(getModalParam("endDate")) : null;
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

  useEffect(() => {
    void loadMeals();
  }, [loadMeals]);

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
            <ChevronLeftIcon aria-hidden="true" className="size-4 sm:size-5" />
          </button>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Next month"
            className="rounded p-1.5 text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:p-2"
          >
            <ChevronRightIcon aria-hidden="true" className="size-4 sm:size-5" />
          </button>
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

          const weekMeals = meals.filter((m) => {
            const mStart = new Date(m.startDate);
            mStart.setHours(0, 0, 0, 0);
            const mEnd = new Date(m.endDate);
            mEnd.setHours(23, 59, 59, 999);

            return mStart <= weekEnd && mEnd >= weekStart;
          });

          const visibleMeals = weekMeals.slice(0, MAX_VISIBLE_MEALS_PER_ROW);

          return (
            <div
              key={weekIdx}
              className="relative grid grid-cols-7 gap-px min-h-[60px] sm:min-h-[120px]"
            >
              {week.map((date, dayIdx) => {
                const isSelected =
                  date !== null &&
                  selectedDates?.some((selected) => isSameDay(date, selected));
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

                const hiddenCount = Math.max(
                  0,
                  dayMeals.length - MAX_VISIBLE_MEALS_PER_ROW,
                );

                return (
                  <button
                    key={date?.toISOString() ?? `empty-${weekIdx}-${dayIdx}`}
                    type="button"
                    disabled={date === null}
                    onClick={() => {
                      date && handleDateClick(date, isBeforeMealStartDate);
                    }}
                    className={`flex flex-col justify-between p-1 sm:p-2 text-left align-top transition h-full
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
                          className={`flex h-5 w-5 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs sm:text-sm font-semibold ${
                            isToday ? "bg-blue-500 text-white" : "text-gray-900"
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
                            <ArrowRightIcon className="size-3 sm:size-4 text-gray-500" />
                          ) : (
                            <PlusIcon className="size-3 sm:size-4 text-gray-500" />
                          )}
                        </div>
                      )}
                    </div>

                    {date && dayMeals.length > 0 && (
                      <div className="flex items-center justify-center gap-0.5 mt-1 sm:hidden">
                        {dayMeals.slice(0, 3).map((m) => (
                          <span
                            key={m.id}
                            className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                          />
                        ))}
                        {dayMeals.length > 3 && (
                          <span className="text-[9px] font-bold text-gray-400">
                            +
                          </span>
                        )}
                      </div>
                    )}

                    {hiddenCount > 0 && (
                      <div className="hidden sm:block w-full text-right text-xs font-semibold text-gray-500">
                        +{hiddenCount} more
                      </div>
                    )}
                  </button>
                );
              })}

              <div
                className="hidden sm:grid pointer-events-none absolute inset-x-0 top-10 bottom-2 grid-cols-7 gap-x-px px-0.5"
                style={{
                  gridTemplateRows: `repeat(${MAX_VISIBLE_MEALS_PER_ROW}, 24px)`,
                  rowGap: "4px",
                }}
              >
                {visibleMeals.map((meal, mealIdx) => {
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
                    <div
                      key={meal.id}
                      className="pointer-events-auto h-6 rounded bg-emerald-500 px-2 text-xs font-semibold text-white shadow-sm flex items-center overflow-hidden z-10"
                      style={{
                        gridColumn: `${startCol} / ${endCol}`,
                        gridRow: mealIdx + 1,
                      }}
                      title={meal.customText ?? "Recipe"}
                    >
                      <span className="truncate">
                        {meal.customText ?? "Recipe"}
                      </span>
                    </div>
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
                  className="flex items-center justify-between rounded bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs sm:text-sm font-medium text-emerald-900"
                >
                  <span>{meal.customText ?? "Recipe"}</span>
                  <span className="text-[10px] text-emerald-700 sm:text-xs">
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
        isOpen={addingMeal}
        onClose={() => {
          setSelectedDates([]);
          closeModal();
        }}
        modalTitle="Add Meal"
        showTick
        handleTick={() => {
          const form = mealAddForm.current;
          if (!form?.reportValidity()) {
            return false;
          }

          form.requestSubmit();
          return true;
        }}
        confirmClose
      >
        <AddMealPopup
          formRef={mealAddForm}
          onMealAdded={loadMeals}
          startDate={mealStartDate || null}
          setStartDate={setMealStartDate}
          endDate={mealEndDate || null}
          setEndDate={setMealEndDate}
          updateHighlights={selectDatesBetween}
        />
      </Modal>
    </div>
  );
};
