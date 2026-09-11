import { MinusIcon, PlusIcon } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";

interface MultiplierPickerProps {
  multiplier: number;
  setMultiplier: Dispatch<SetStateAction<number>>;
}

export const MultiplierPicker = ({
  multiplier,
  setMultiplier,
}: MultiplierPickerProps) => {
  const multipliers = [0.25, 0.5, 0.75, 1, 2, 3, 4, 5, 6];

  const [index, setIndex] = useState(() => multipliers.indexOf(multiplier));

  const changeIndex = (newIndex: number) => {
    setIndex(newIndex);
    setMultiplier(multipliers[newIndex]);
  };

  const previous = () => {
    const newIndex = index === 0 ? multipliers.length - 1 : index - 1;

    changeIndex(newIndex);
  };

  const next = () => {
    const newIndex = index === multipliers.length - 1 ? 0 : index + 1;

    changeIndex(newIndex);
  };

  return (
    <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200">
      <button type="button" onClick={previous}>
        <MinusIcon size={18} className="shadow-sm" />
      </button>

      <span className="min-w-10 text-center">{multipliers[index]}x</span>

      <button type="button" onClick={next}>
        <PlusIcon size={18} className="shadow-sm" />
      </button>
    </div>
  );
};
