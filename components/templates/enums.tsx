"use client";

import { useState, useEffect } from "react";

import { getEnums, enumType } from "@/actions/enums";

type EnumOptionsProps = {
  enumType: enumType;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const EnumOptions = ({ enumType, ...inputProps }: EnumOptionsProps) => {
  const [enums, setEnums] = useState([]);
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
          <input type="checkbox" value={option.id} {...inputProps} />
          {option.name.charAt(0).toUpperCase() + option.name.substring(1)}
        </label>
      ))}
    </div>
  );
};
