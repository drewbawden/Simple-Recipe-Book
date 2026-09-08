"use client";

import { useState, useEffect } from "react";

import { getCategories } from "@/actions/items";
import { error } from "console";

type dropdownItem = {
  slug: string;
  displayName: string | null;
  orderIndex: number;
  userCreated: boolean;
};

export const CategoryDropdown = () => {
  const [categories, setCategories] = useState<dropdownItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        if (!data) throw new Error("data contains no value");
        setCategories(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <p>Loading Categories...</p>;
  }

  return (
    <select>
      {categories.map((category) => (
        <option key={category.slug} value={category.slug}>
          {category.displayName ?? category.slug}
        </option>
      ))}
    </select>
  );
};
