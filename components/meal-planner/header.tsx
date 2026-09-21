import { HouseIcon } from "lucide-react";
import Link from "next/link";

export const MealPlannerHeader = () => {
  return (
    <div className="w-full flex">
      <Link
        href="/"
        className="bg-blue-500 hover:bg-blue-700 active:bg-blue-800 text-white font-bold p-2 rounded border border-blue-600 shadow-sm"
      >
        <HouseIcon />
      </Link>
    </div>
  );
};
