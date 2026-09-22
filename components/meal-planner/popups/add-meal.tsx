import { Dispatch, SetStateAction } from "react";

interface AddMealPopupProps {
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: Dispatch<SetStateAction<Date | null>>;
  setEndDate: Dispatch<SetStateAction<Date | null>>;
  updateHighlights: (startDate: Date, endDate: Date) => void;
}

const parseDateInput = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const AddMealPopup = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  updateHighlights,
}: AddMealPopupProps) => {
  if (!startDate || !endDate) return null;

  const isDateValid = (date: Date, dateType: "start" | "end") => {
    if (dateType === "start" && date <= endDate) return true;
    if (dateType === "end" && date >= startDate) return true;

    alert("Invalid date!");
    return false;
  };

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="startDate"
        className="flex flex-row justify-between rounded bg-gray-100 p-1"
      >
        <span>Start date</span>
        <input
          type="date"
          id="startDate"
          name="startDate"
          max={formatDateInput(endDate)}
          value={formatDateInput(startDate)}
          onChange={(e) => {
            const date = parseDateInput(e.target.value);
            if (isDateValid(date, "start")) {
              setStartDate(date);
              updateHighlights(date, endDate);
            }
          }}
        />
      </label>

      <label
        htmlFor="endDate"
        className="flex flex-row justify-between rounded bg-gray-100 p-1"
      >
        <span>End date</span>
        <input
          type="date"
          id="endDate"
          name="endDate"
          min={formatDateInput(startDate)}
          value={formatDateInput(endDate)}
          onChange={(e) => {
            const date = parseDateInput(e.target.value);
            if (isDateValid(date, "end")) {
              setEndDate(date);
              updateHighlights(startDate, date);
            }
          }}
        />
      </label>
    </div>
  );
};
