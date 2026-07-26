"use client";

import { useState, useEffect } from "react";

import { getEnums, enumType } from "@/actions/enums";

type EnumOptionsProps = {
  enumType: enumType;
  selected?: string[];
  onChange?: (selected: string[]) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">;

type enumItem = {
  id: string;
  name: string;
};

export const EnumOptions = ({
  enumType,
  selected,
  onChange,
  ...inputProps
}: EnumOptionsProps) => {
  const [enums, setEnums] = useState<enumItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnums = async (enumType: enumType) => {
      try {
        const data = await getEnums(enumType);
        if (data === undefined) {
          throw new Error();
        }

        setEnums(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching options:", error);
        setLoading(false);
      }
    };

    fetchEnums(enumType);
  }, []);

  if (loading) {
    return <p>Loading options...</p>;
  }

  return (
    <div>
      {enums.map((option) => (
        <label key={option.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            value={option.id}
            checked={selected?.includes(option.id) ?? false}
            onChange={(e) => {
              if (!onChange) return;

              if (e.target.checked) {
                onChange([...selected!, option.id]);
              } else {
                onChange(selected!.filter((id) => id !== option.id));
              }
            }}
            {...inputProps}
          />
          {option.name.charAt(0).toUpperCase() + option.name.substring(1)}
        </label>
      ))}
    </div>
  );
};
