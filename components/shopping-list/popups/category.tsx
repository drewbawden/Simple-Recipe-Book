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
    <div className="text-gray-900">
      <DynamicOptions
        listType="categories"
        selected={slug}
        onChange={handleOnChange}
      />
    </div>
  );
};
