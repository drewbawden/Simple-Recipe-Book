"use client"

import { useState, useEffect } from 'react';

import { getCategories } from '@/actions/dropdowns';
import { getEnums, enumType } from '@/actions/enums';

export const CategoryDropdown = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <p>Loading Categories...</p>
  }

  return (
    <select>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
}

type EnumDropdownProps = {
  enumType: enumType;
  name?: string;
  id?: string;
};

export const EnumDropdown = ({ enumType, name, id }: EnumDropdownProps) => {
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
        console.error('Error fetching options:', error);
        setLoading(false);
      }
    };

    fetchEnums(enumType);
  }, []);

  if (loading) {
    return <p>Loading options...</p>
  }

  return (
    <select required name={name || ''} id={id || ''} defaultValue='' className='border-solid border-1 rounded p-1 border-gray-400'>
      <option value='' disabled>--select an option--</option>
      {enums.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  );
}
