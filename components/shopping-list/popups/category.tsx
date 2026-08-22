import { DynamicOptions } from "@/components/templates/options";

interface ChangeCategoryPopupProps {
  slug: string;
  setSlug: (slug: string) => void;
  onClose: () => void;
}
export const ChangeCategoryPopup = ({
  slug,
  setSlug,
  onClose,
}: ChangeCategoryPopupProps) => {
  const handleOnChange = (newSlug: string) => {
    setSlug(newSlug);
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
      <DynamicOptions
        listType="categories"
        selected={slug}
        onChange={handleOnChange}
      />
    </div>
  );
};
