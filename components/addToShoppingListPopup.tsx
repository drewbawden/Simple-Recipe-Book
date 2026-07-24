"use client"

import { useEffect, useState } from 'react';
import Form from 'next/form';
import { addRecipeToShoppingList } from '@/actions/shoppingList';
import { redirect, RedirectType } from 'next/navigation';

export const AddToShoppingListPopup = ({ closePopup, recipe }) => {
  const ingredients = recipe.ingredients;

  const [selectedIngredientIds, setSelectedIngredientIds] = useState(
    () => new Set(ingredients.map((ingredient) => ingredient.id))
  );
  const [allSelected, setAllSelected] = useState(true);

  useEffect(() => {
    const ingredientIds = ingredients.map((ingredient) => ingredient.id);
    setSelectedIngredientIds(new Set(ingredientIds));
    setAllSelected(ingredientIds.length > 0);
  }, [ingredients]);

  useEffect(() => {
    setAllSelected(
      ingredients.length > 0 && selectedIngredientIds.size === ingredients.length
    );
  }, [ingredients.length, selectedIngredientIds]);

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIngredientIds(new Set());
      setAllSelected(false);
      return;
    }

    setSelectedIngredientIds(new Set(ingredients.map((ingredient) => ingredient.id)));
    setAllSelected(true);
  };

  const toggleIngredient = (id) => {
    setSelectedIngredientIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  async function handleAdd(formData: FormData){
    const continueToList = formData.get('continueToList');
    addRecipeToShoppingList(formData);
    if (continueToList) {
      redirect('/list', RedirectType.push);
    }
    closePopup();
  }

  return (
    <div className='text-gray-900'>
      <h1 className='text-2xl p-2 pb-4'>Add Ingredients to Shopping List</h1>
      <hr className='h-0.5 bg-black' />
      <Form action={handleAdd}>
      <div className='flex p-2 justify-between space-x-2 items-center'>
          <div className='border border-gray-200 rounded-xl p-2 space-x-2'>
            <label htmlFor='selectAllCheck'>Select All</label>
            <input
              id='selectAllCheck'
              type='checkbox'
              checked={allSelected}
              onChange={toggleSelectAll}
            />
          </div>
          <div className='border border-gray-200 rounded-xl p-2 space-x-2'>
            <label htmlFor='continueToList'>Continue to shopping list?</label>
            <input
              id='continueToList'
              name='continueToList'
              type='checkbox'
            />
        </div>
      </div>
      <hr className='h-0.5 bg-black' />
        <ul className='mt-4 divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm'>
          {ingredients.map((ingredient) => {
            const ingredientCheckboxId = `ingredient-${ingredient.id}`;
            const isChecked = selectedIngredientIds.has(ingredient.id);

            return (
              <li key={ingredient.id}>
                <label
                  htmlFor={ingredientCheckboxId}
                  className='flex justify-between items-center p-3.5 hover:bg-gray-50 transition space-x-2'
                >
                  <input
                    id={ingredientCheckboxId}
                    name='ingredientIds'
                    type='checkbox'
                    value={ingredient.id}
                    checked={isChecked}
                    onChange={() => toggleIngredient(ingredient.id)}
                  />
                  <span className='font-medium text-gray-900'>
                    {ingredient.item.name}
                  </span>
                  <span className='bg-gray-100 text-gray-700 text-sm font-semibold px-3 py-1 rounded-md border border-gray-200'>
                    {ingredient.quantity} {ingredient.unit}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>

        <div className='mt-4 flex flex-wrap justify-end gap-3'>
          <button
            type='button'
            onClick={closePopup}
            className='rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition'
          >
            Cancel
          </button>
          <button
            type='submit'
            className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition'
          >
            Add Selected
          </button>
        </div>
      </Form>
    </div>
  );
}
