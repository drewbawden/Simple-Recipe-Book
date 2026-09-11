import { ChevronRightIcon } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";

interface SelectProps<T> {
  value: T | null;
  onChange: (value: T | null) => void;
  options: readonly T[];
  getValue: (option: T) => string;
  getLabel: (option: T) => string;
  renderOption?: (option: T, selected: boolean) => ReactNode;
  placeholder?: string;
  clearLabel?: string;
  containerClass?: string;
  selectClass?: string;
}

export const Select = <T,>({
  value,
  onChange,
  options,
  getValue,
  getLabel,
  renderOption,
  placeholder = "Select an option",
  clearLabel = "Clear",
  containerClass,
  selectClass,
}: SelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    options.find(
      (option) => value !== null && getValue(option) === getValue(value),
    ) ?? null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option: T | null) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative min-w-25 ${containerClass ?? ""}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={
          selectClass ||
          "bg-gray-100 p-2 rounded w-full flex items-center justify-between"
        }
      >
        <span className={selectedOption ? "" : "text-gray-500"}>
          {selectedOption ? getLabel(selectedOption) : placeholder}
        </span>

        <ChevronRightIcon
          size={18}
          className={`transition-transform ${isOpen ? "rotate-90" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg overflow-hidden">
          {clearLabel && (
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className="w-full p-2 flex items-center gap-2 text-left hover:bg-gray-100"
            >
              <span className="text-gray-500">{clearLabel}</span>
            </button>
          )}

          {options.map((option) => {
            const selected =
              selectedOption !== null &&
              getValue(selectedOption) === getValue(option);

            return (
              <button
                key={getValue(option)}
                type="button"
                onClick={() => handleSelect(option)}
                className="w-full p-2 flex items-center gap-2 text-left hover:bg-gray-100"
              >
                {renderOption ? (
                  renderOption(option, selected)
                ) : (
                  <span>{getLabel(option)}</span>
                )}

                {selected && (
                  <span className="ml-auto text-sm text-gray-500">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
