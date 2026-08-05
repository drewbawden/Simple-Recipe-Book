import Form from "next/form";

export const MainFilterBar = () => {
  return (
    <Form
      action={() => {}}
      className="bg-white p-2 rounded m-2 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-2"
    >
      <div className="bg-gray-100 rounded text-gray-900 space-x-2 p-1 shadow-md flex flex-row justify-between">
        <label htmlFor="nameFilter">Name</label>
        <input
          type="text"
          id="nameFilter"
          placeholder="Enter a recipe name..."
          className="border-1 rounded p-1"
        />
      </div>
      <div className="bg-gray-100 rounded text-gray-900 space-x-2 p-1 shadow-md flex flex-row justify-between">
        <label htmlFor="typeFilter">Type</label>
        <input
          type="text"
          id="typeFilter"
          placeholder="Enter a recipe type..."
          className="border-1 rounded p-1"
        />
      </div>
      <div className="bg-gray-100 rounded text-gray-900 space-x-2 p-1 shadow-md flex flex-row justify-between">
        <label htmlFor="ingredientFilter">Ingredient(s)</label>
        <input
          type="text"
          id="ingredientFilter"
          placeholder="Enter an ingredient..."
          className="border-1 rounded p-1"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white text-base font-bold py-2 px-2 rounded hover:bg-blue-600 active:bg-blue-700"
      >
        Filter
      </button>
    </Form>
  );
};
