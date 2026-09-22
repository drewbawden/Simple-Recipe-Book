"use client";

import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getDaysInMonth = (date: Date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const daysInMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();
  const dayOfWeek = firstDay.getDay();
  const leadingDays = (dayOfWeek + 6) % 7;

  return Array.from({ length: leadingDays + daysInMonth }, (_, index) =>
    index < leadingDays ? null : index - leadingDays + 1,
  );
};

const isSameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

export const MealPlannerCalendar = () => {
  const today = new Date();
  const [displayedMonth, setDisplayedMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const days = getDaysInMonth(displayedMonth);
  const [mealStartDate, setMealStartDate] = useState<Date | null>(null);

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

  const handleMealStart = (date: Date) => {
    setMealStartDate(date);
  };

  const handleMealEnd = (date: Date) => {
    // call function with (mealStartDate, date)
    setMealStartDate(null);
    setSelectedDate(null);
  };

  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
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
            className="mr-2 rounded border border-blue-600 bg-blue-500 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
            className="rounded p-2 text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ChevronLeftIcon aria-hidden="true" size={20} />
          </button>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Next month"
            className="rounded p-2 text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ChevronRightIcon aria-hidden="true" size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-100 px-2 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600 sm:px-4">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday}>{weekday}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 p-px">
        {days.map((day, index) => {
          const date = day
            ? new Date(
                displayedMonth.getFullYear(),
                displayedMonth.getMonth(),
                day,
              )
            : null;
          const isSelected =
            date !== null &&
            selectedDate !== null &&
            isSameDay(date, selectedDate);
          const isToday = date !== null && isSameDay(date, today);

          return (
            <button
              key={date?.toISOString() ?? `empty-${index}`}
              type="button"
              disabled={date === null}
              onClick={() => date && setSelectedDate(date)}
              className={`relative min-h-20 p-2 text-left align-top transition sm:min-h-28 sm:p-3 ${
                date === null ? "cursor-default opacity-45" : ""
              } ${isSelected ? "ring-2 ring-inset ring-blue-500 bg-blue-50 hover:bg-blue-100" : "bg-white hover:bg-gray-50"}`}
            >
              {date && (
                <span
                  className={`absolute top-2 left-2 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                    isToday ? "bg-blue-500 text-white" : "text-gray-900"
                  }`}
                >
                  {day}
                </span>
              )}
              {isSelected && (
                <div
                  role="button"
                  onClick={() => {
                    handleMealStart(date);
                  }}
                  className="size-full flex items-center justify-center"
                >
                  <span>
                    <PlusIcon />
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <p className="border-t border-gray-200 px-4 py-3 text-sm text-gray-500 sm:px-6">
        Selected:{" "}
        {selectedDate &&
          selectedDate.toLocaleDateString("en-US", { dateStyle: "long" })}
      </p>
    </div>
  );
};
