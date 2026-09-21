import Link from "next/link";
import { rogueScript } from "@/app/ui/fonts";

export const PageOptions = () => {
  return (
    <div className="w-full flex flex-col items-center h-[95dvh] justify-center p-4 sm:p-10 gap-10">
      <Link
        href="/recipes"
        className={`${rogueScript.className} w-full bg-white p-5 sm:p-10 rounded-xl font-bold text-6xl sm:text-8xl lg:text-9xl border border-gray-200 shadow-md text-center`}
      >
        Recipes
      </Link>

      <Link
        href="/list"
        className={`${rogueScript.className} w-full bg-white p-5 sm:p-10 rounded-xl font-bold text-6xl sm:text-8xl lg:text-9xl border border-gray-200 shadow-md text-center`}
      >
        Shopping List
      </Link>

      <Link
        href="/planner"
        className={`${rogueScript.className} w-full bg-white p-5 sm:p-10 rounded-xl font-bold text-6xl sm:text-8xl lg:text-9xl border border-gray-200 shadow-md text-center`}
      >
        Meal Planner
      </Link>
    </div>
  );
};
