import { NormalUnit } from "@/app/generated/prisma/enums";

type IngredientsPopupProps = {
  ingredients: {
    id: number;
    name: string;
    quantity: string;
    unit?: string;
    normalQuantity?: number;
    normalUnit?: NormalUnit;
  }[];
};
export const IngredientPopup = ({ ingredients }: IngredientsPopupProps[]) => {
  return (
    <div className="text-gray-900 ">
      <h1 className="text-2xl p-2 pb-4">Ingredients</h1>
      <hr className="h-0.5 bg-black" />
      <ul className="mt-4 divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        {ingredients.map((ingredient) => (
          <li
            key={ingredient.id}
            className="flex justify-between items-center p-3.5 hover:bg-gray-50 transition"
          >
            <span className="font-medium text-gray-900">
              {ingredient.item.name}
            </span>
            <span className="bg-gray-100 text-gray-700 text-sm font-semibold px-3 py-1 rounded-md border border-gray-200">
              {ingredient.quantity} {ingredient.unit}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

type NotesPopupProps = {
  notes: string;
};
export const NotesPopup = ({ notes }: NotesPopupProps) => {
  return (
    <div className="text-gray-900">
      <h1 className="text-2xl p-2 pb-4">Notes</h1>
      <hr className="h-0.5 bg-black" />
      <p className="p-4 break-all">{notes}</p>
    </div>
  );
};
