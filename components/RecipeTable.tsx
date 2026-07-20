"use client"

import { useState, useEffect } from 'react';
import Form from 'next/form';
import Link from 'next/link';
import Image from 'next/image';

import { getRecipes, insertNewRecipe } from '@/actions/recipes';
import AutocompleteInput from './autocomplete';
import { Modal } from '@/components/modal';
import { NormalUnit } from "../app/generated/prisma/enums";
import { AddToShoppingListPopup } from "./shoppingList"
import { isValidQuantity } from '@/lib/quantity';
import { EnumOptions } from './enums';
import imageCompression from 'browser-image-compression';

export const RecipeTable = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState(null);
  const [selectedNotes, setSelectedNotes] = useState(null);
  const [isAddShoppingListOpen, setIsAddShoppingListOpen] = useState(false);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getRecipes();
        setRecipes(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const refreshRecipes = async () => {
    const data = await getRecipes();
    setRecipes(data);
  }

  if (loading) {
    return <p>Loading Recipes...</p>
  }

  return (
    <div>
      <div className="flex flex-col items-center m-8">
        <button className="bg-blue-500 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2 px-4 rounded "
          type="button"
          onClick={() => setIsAddRecipeOpen(true)}>
          Add Recipe
        </button>
      </div>

      {/* mobile layout */}
      <div className="block md:hidden space-y-4 px-4">
        {recipes.map((recipe) => (


          <div key={recipe.id} className="text-gray-900 p-4 border rounded-lg shadow-sm bg-white space-y-2">
            {recipe.imagePath ? (
              <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden rounded-lg">
                <Image
                  src={recipe.imagePath}
                  alt={recipe.name}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw,
                         (max-width: 1200px) 50vw,
                         33vw"
                />
              </div>) : (null)}
            <div className="flex justify-between items-start">
              <Link href={recipe.url || "#"} className={`text-lg ${recipe.url ? "underline font-bold" : ""}`}>
                {recipe.name}
              </Link>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded ml-2">{recipe.types.join(', ') || "---"}</span>
            </div>
            <div className="flex gap-4 text-sm text-gray-600">
              {recipe.servingSize ? (<span>{recipe.servingSize} servings</span>) :
                (null)
              }
              {recipe.totalTimeMins ? (<span>{recipe.totalTimeMins} mins</span>) :
                (null)
              }
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <div>
                <p className="text-xs text-gray-500">Ingredients</p>
                {recipe.ingredients.length > 0 ? (
                  <button onClick={() => setSelectedIngredients(recipe)} className="text-blue-500 underline font-bold">
                    {recipe.ingredients.length} Items
                  </button>
                ) : "0"}
              </div>

              <div>
                <p className="text-xs text-gray-500">Notes</p>
                {recipe.notes ? (
                  <button onClick={() => setSelectedNotes(recipe)} className="text-blue-500 underline font-bold truncate max-w-32">
                    View Notes
                  </button>
                ) : "---"}
              </div>

              <button className="bg-blue-500 text-white text-sm font-bold py-1 px-3 rounded">
                Add
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* desktop layout */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full text-center table-fixed">
          <thead>
            <tr>
              <th className="text-center align-middle p-4 border-b border-blue-gray-100 bg-blue-gray-50">Name</th>
              <th className="text-center align-middle p-4 border-b border-blue-gray-100 bg-blue-gray-50">Type</th>
              <th className="text-center align-middle p-4 border-b border-blue-gray-100 bg-blue-gray-50">Serving Size</th>
              <th className="text-center align-middle p-4 border-b border-blue-gray-100 bg-blue-gray-50">Time to make (mins)</th>
              <th className="text-center align-middle p-4 border-b border-blue-gray-100 bg-blue-gray-50">Ingredients</th>
              <th className="text-center align-middle p-4 border-b border-blue-gray-100 bg-blue-gray-50">Notes</th>
              <th className="text-center align-middle p-4 border-b border-blue-gray-100 bg-blue-gray-50">Add to shopping list</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((recipe) => (
              <tr key={recipe.id} value={recipe.id}>
                <td
                  className={`text-center align-middle p-4 border-b border-blue-gray-50 ${recipe.url ? "underline font-bold" : ""
                    }`}
                >
                  {recipe.imagePath ? (
                    <div className="relative w-48 h-32 mx-auto">
                      <Image
                        src={recipe.imagePath}
                        alt="Recipe Image"
                        fill
                        className="object-cover rounded"
                        sizes="(max-width: 768px) 100vw,
                               (max-width: 1200px) 50vw,
                               33vw"
                      />
                      <p className="absolute inset-0 flex items-center justify-center z-10 text-white font-bold text-lg bg-black/30">
                        <Link href={recipe.url || "#"}>{recipe.name}</Link>
                      </p>
                    </div>
                  ) : (
                    <p title="Recipe name">
                      <Link href={recipe.url || "#"}>{recipe.name}</Link>
                    </p>
                  )}
                </td>
                <td className="text-center align-middle p-4 border-b border-blue-gray-50">
                  <p title='Recipe Type(s)'>
                    {recipe.types.join(', ') || "---"}
                  </p>
                </td>
                <td className="text-centerName align-middle p-4 border-b border-blue-gray-50">
                  <p title='Serving Size'>
                    {recipe.servingSize ?
                      (recipe.servingSize + " serves") :
                      ('---')
                    }
                  </p>
                </td>
                <td className="text-center align-middle p-4 border-b border-blue-gray-50">
                  <p title='Time to make (mins)'>
                    {recipe.totalTimeMins ?
                      (recipe.totalTimeMins + " mins") :
                      ('---')
                    }
                  </p>
                </td>
                <td className="text-center align-middle p-4 border-b border-blue-gray-50">
                  {recipe.ingredients.length > 0 ? (
                    <button
                      onClick={() => setSelectedIngredients(recipe)}
                      className="border-1 hover:bg-gray-900 active:bg-gray-800 text-white font-bold py-2 px-4 rounded"
                      title='View ingredients'
                    >
                      {recipe.ingredients.length} Items
                    </button>
                  ) : (
                    <p title='Ingredients'>
                      0
                    </p>
                  )}
                </td>
                <td className="text-center align-middle p-4 border-b border-blue-gray-50 max-w-40 max-h-8">
                  {recipe.notes ? (
                    <button
                      onClick={() => setSelectedNotes(recipe)}
                      className="max-w-80 border-1 hover:bg-gray-900 active:bg-gray-800 text-white font-bold py-2 px-4 rounded"
                      title='View notes'
                    >
                      View Notes
                    </button>
                  ) : (
                    <p title='Notes'>
                      ---
                    </p>
                  )}
                </td>
                <td className="text-center align-middle p-4 border-b border-blue-gray-50">
                  <button title='Add to shopping list' className="bg-blue-500 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2 px-4 rounded"
                    onClick={() => setIsAddShoppingListOpen(true)}
                    type="button">
                    Add
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={selectedIngredients !== null} onClose={() => setSelectedIngredients(null)} size='lg'>
        {selectedIngredients && (
          <IngredientPopup ingredients={selectedIngredients.ingredients} />
        )}
      </Modal>
      <Modal isOpen={selectedNotes !== null} onClose={() => setSelectedNotes(null)}>
        {selectedNotes && (
          <NotesPopup notes={selectedNotes.notes} />
        )}
      </Modal>
      <Modal isOpen={isAddRecipeOpen} onClose={() => setIsAddRecipeOpen(false)}>
        <AddRecipePopup closePopup={() => setIsAddRecipeOpen(false)} refreshRecipes={refreshRecipes} />
      </Modal>
      <Modal isOpen={isAddShoppingListOpen} onClose={() => setIsAddShoppingListOpen(false)}>
        <AddToShoppingListPopup closePopup={() => setIsAddShoppingListOpen(false)} />
      </Modal>
    </div>
  );
}


const AddRecipePopup = ({ closePopup, refreshRecipes }) => {
  const [isIngredientsOpen, setIsIngredientsOpen] = useState(false);
  const [ingredientsList, setIngredientsList] = useState([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(
    "/recipe-pictures/placeholder.png"
  );


  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    const compressed = await imageCompression(file, {
      maxSizeMB: 2,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    });

    setImageFile(compressed);
    setImagePreview(URL.createObjectURL(compressed));
  };
  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleSubmit = (e) => {
    const checked = e.currentTarget.querySelectorAll(
      'input[name="recipeType"]:checked'
    );

    if (checked.length === 0) {
      e.preventDefault();
      alert("Please select at least one recipe type.");
    }
  };

  return (
    <div className="flex flex-col max-h-[80vh] w-full text-gray-900">
      <Form action={async (formData) => {
        if (imageFile) {
          formData.set("recipeImage", imageFile);
        }
        await insertNewRecipe(formData);
        await refreshRecipes();
        closePopup();
      }}
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto pr-1 space-y-5 text-gray-900">
        <div className="relative h-64 w-full mt-6 mb-2 group overflow-hidden rounded-lg">
          <Image
            src={imagePreview}
            alt="Recipe"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55" />
          <label
            htmlFor="recipeImage"
            className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center text-3xl font-semibold text-white"
          >
            {imageFile ? "Change Image" : "+ Add Image"}
          </label>
          <input
            id="recipeImage"
            name="recipeImage"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
        <hr className='h-0.5 bg-black' />

        <div className="flex flex-col space-y-1.5 pt-2">
          <label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center">
            Recipe name <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full px-3 py-2 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition text-base"
            required
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label htmlFor="recipeType" className="text-sm font-semibold text-gray-700 flex items-center">
            Recipe type <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="w-full">
            <EnumOptions id="recipeType" name="recipeType" enumType='recipeType' />
          </div>
        </div>

        <div className="flex flex-col space-y-1.5">
          <label htmlFor="servingSize" className="text-sm font-semibold text-gray-700">
            Serving Size
          </label>
          <input
            type="number"
            id="servingSize"
            name="servingSize"
            placeholder="e.g. 4"
            className="w-full px-3 py-2 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base"
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label htmlFor="totalTime" className="text-sm font-semibold text-gray-700">
            Time to make (minutes)
          </label>
          <input
            type="number"
            id="totalTime"
            name="totalTime"
            placeholder="e.g. 45"
            className="w-full px-3 py-2 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base"
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label htmlFor="url" className="text-sm font-semibold text-gray-700">
            Recipe URL
          </label>
          <input
            type="url"
            id="url"
            name="url"
            placeholder="https://example.com/recipe"
            className="w-full px-3 py-2 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base"
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label htmlFor="notes" className="text-sm font-semibold text-gray-700">
            Additional notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="w-full px-3 py-2 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base"
          />
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsIngredientsOpen(true)}
            className="w-full flex items-center justify-between border border-gray-400 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition shadow-sm"
          >
            <span className="text-sm font-semibold">Ingredients</span>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">
              {ingredientsList.length} {ingredientsList.length === 1 ? 'item' : 'items'}
            </span>
          </button>
          <input type='hidden' name='ingredients' value={JSON.stringify(ingredientsList)} />
        </div>

        <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 flex flex-col sm:flex-row-reverse gap-3 mt-6 pb-1">
          <button
            type='submit'
            className="w-full sm:w-auto sm:px-6 py-3 rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-500 active:bg-blue-700 shadow-md hover:shadow-lg transition text-center"
          >
            Add Recipe
          </button>
          <button
            type='button'
            onClick={closePopup}
            className="w-full sm:w-auto sm:px-6 py-3 rounded-lg bg-gray-100 font-semibold text-gray-700 hover:bg-gray-200 active:bg-gray-300 transition text-center"
          >
            Cancel
          </button>
        </div>
      </Form>
      <Modal isOpen={isIngredientsOpen} onClose={() => setIsIngredientsOpen(false)} size='sm'>
        <AddIngredientsPopup
          ingredientsList={ingredientsList}
          setIngredientsList={setIngredientsList}
        />
      </Modal>

    </div >
  );
}


const AddIngredientsPopup = ({ ingredientsList, setIngredientsList }) => {

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [foodId, setFoodId] = useState(null);

  function addIngredient() {
    if (!name || !quantity) return;

    setIngredientsList(prev => [
      ...prev,
      {
        name: name.toLowerCase(),
        quantity,
        foodId
      }
    ]);

    setName("");
    setQuantity("");
    setFoodId(null);
  }


  return (
    <div className="text-gray-900">
      <Form action={addIngredient} className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Ingredient</label>
            <AutocompleteInput
              modelType='foods'
              placeholder="Enter ingredient..."
              value={name}
              onChange={(value) => setName(value)}
              onSelect={(item) => { setFoodId(item.id); }}
              className="w-full px-3 py-2 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label htmlFor='quantity' className="text-sm font-semibold text-gray-700">Quantity</label>
            <input
              required
              type="text"
              id="quantity"
              value={quantity}
              name="quantity"
              placeholder="e.g. 200g, 2 tbsps"
              className="w-full px-3 py-2 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              onChange={(e) => {
                const value = e.target.value;
                setQuantity(value);
                const parsed = isValidQuantity(value);

                e.target.setCustomValidity(
                  !parsed ? "Please enter a valid quantity."
                    : ""
                );
              }}
            />
          </div>

        </div>

        <button
          type='submit'
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition shadow-sm text-center block sm:inline-block"
        >
          Add Ingredient
        </button>
      </Form>

      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-6 mb-2 px-1">
        Current Ingredients
      </h3>

      {ingredientsList.length === 0 ? (
        <p className="text-sm text-gray-400 italic px-1">No ingredients</p>
      ) : (
        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          {ingredientsList.map((ingredient, index) => (
            <li key={index} className="flex justify-between items-center p-3.5 hover:bg-gray-50 transition">
              <span className="font-medium text-gray-900">{ingredient.name}</span>
              <span className="bg-gray-100 text-gray-700 text-sm font-semibold px-3 py-1 rounded-md border border-gray-200">
                {ingredient.quantity}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


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
const IngredientPopup = ({ ingredients }: IngredientsPopupProps[]) => {
  return (
    <div className='text-gray-900 '>
      <h1 className='text-2xl p-2 pb-4'>Ingredients</h1>
      <hr className='h-0.5 bg-black' />
      <ul className='mt-4 divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm'>
        {ingredients.map((ingredient) => (
          <li key={ingredient.id} className="flex justify-between items-center p-3.5 hover:bg-gray-50 transition">
            <span className="font-medium text-gray-900">{ingredient.item.name}</span>
            <span className="bg-gray-100 text-gray-700 text-sm font-semibold px-3 py-1 rounded-md border border-gray-200">
              {ingredient.quantity} {ingredient.unit}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type NotesPopupProps = {
  notes: string;
};
const NotesPopup = ({ notes }: NotesPopupProps) => {
  return (
    <div className='text-gray-900'>
      <h1 className='text-2xl p-2 pb-4'>Notes</h1>
      <hr className='h-0.5 bg-black' />
      <p className='p-4 break-all'>{notes}</p>
    </div>
  );
}
