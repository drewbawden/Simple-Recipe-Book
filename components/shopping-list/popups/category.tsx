import { DynamicOptions } from "@/components/templates/options";

interface ChangeCategoryPopupProps {
  slug: string;
  setSlug: (slug: string) => void;
}
export const ChangeCategoryPopup = ({
  slug,
  setSlug,
}: ChangeCategoryPopupProps) => {
  return (
    <div className="text-gray-900">
      <DynamicOptions
        listType="categories"
        selected={slug}
        onChange={setSlug}
      />
    </div>
  );
};
