import { deleteCategory } from "@/actions/items";
import { DynamicOptions } from "@/components/templates/options";
import { computeCategory } from "@/lib/category";

interface ChangeCategoryPopupProps {
  slug: string | null;
  setSlug: (slug: string | null) => void;
  onClose: () => void;
  itemName: string;
}
export const ChangeCategoryPopup = ({
  slug,
  setSlug,
  onClose,
  itemName,
}: ChangeCategoryPopupProps) => {
  const handleOnChange = (newSlug: string) => {
    setSlug(newSlug);
    onClose();
  };

  const handleDeleteCategory = async (slug: string) => {
    await deleteCategory(slug);
  };

  const handleAutoCategorise = async () => {
    const autoSlug = await computeCategory(itemName, true);
    console.log(autoSlug);
    setSlug(autoSlug);
    onClose();
  };

  return (
    <div className="text-gray-900 space-y-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onClose();
        }}
      >
        <label
          htmlFor="newCategory"
          className="bg-gray-200 flex flex-col p-2 rounded"
        >
          <span className="font-bold">Add new category</span>
          <input
            type="text"
            name="newCategory"
            id="newCategory"
            className="border-1 rounded"
            onChange={(e) => setSlug(e.target.value)}
          />
          <input type="submit" hidden />
        </label>
      </form>
      <div className="p-2 bg-gray-200">
        <label className="flex items-center justify-between bg-gray-200 p-1 w-full border-y-1">
          <span>Auto Categorise</span>
          <input
            type="checkbox"
            onChange={(e) => {
              if (e.target.checked) {
                handleAutoCategorise();
              }
            }}
          />
        </label>
      </div>
      <DynamicOptions
        listType="categories"
        selected={slug}
        onChange={handleOnChange}
        deletable="userCreated"
        onDelete={handleDeleteCategory}
      />
    </div>
  );
};
