import { Modal } from "@/components/templates/modal";
import { listItem } from "@/types/list-item";
import { Ref, useState } from "react";
import { ChangeCategoryPopup } from "./category";
import { ChevronRightIcon } from "lucide-react";

interface ItemEditPopupProps {
  initialData: listItem | null;
  formRef: Ref<HTMLFormElement>;
  onSubmit: (formData: FormData) => void | Promise<void>;
}
export const ItemEditPopup = ({
  initialData,
  formRef,
  onSubmit,
}: ItemEditPopupProps) => {
  const fallbackData: listItem = {
    id: 0,
    name: "",
    urgent: false,
    categorySlug: "",
  };

  const resolvedInitialData = initialData ?? fallbackData;
  const [name, setName] = useState(resolvedInitialData.name ?? "");
  const [notes, setNotes] = useState(resolvedInitialData.notes ?? "");
  const [url, setUrl] = useState(resolvedInitialData.url ?? "");
  const [urgent, setUrgent] = useState(resolvedInitialData.urgent);
  const [categorySlug, setCategorySlug] = useState(
    resolvedInitialData.categorySlug,
  );

  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  if (!initialData) {
    return null;
  }

  return (
    <div>
      <form
        ref={formRef}
        className="text-gray-900 space-y-2"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(new FormData(event.currentTarget));
        }}
      >
        <div className="border-1 border-gray-200 rounded p-1 space-y-2">
          <input
            type="hidden"
            name="id"
            id="id"
            value={resolvedInitialData.id}
          />
          <input
            type="text"
            placeholder="Name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block p-2 bg-gray-100 rounded w-full font-bold text-2xl"
          />
          <input
            type="text"
            placeholder="Notes"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="block p-1 bg-gray-100 rounded w-full"
          />
          <input
            type="text"
            placeholder="URL"
            name="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="block p-1 bg-gray-100 rounded w-full"
          />
        </div>
        {/* <div>
          <h2>List select</h2>
        </div> */}
        <div>
          <button
            type="button"
            className="bg-gray-200 p-2 rounded w-full flex flex-row justify-between items-center"
            onClick={() => setIsCategoriesOpen(true)}
          >
            Category
            <div className="w-auto">
              <span className="text-gray-500 text-sm">
                {categorySlug || ""}
              </span>
              <ChevronRightIcon className="inline text-gray-500" size={20} />
            </div>
          </button>
          <input
            type="hidden"
            value={categorySlug || ""}
            name="categorySlug"
            id="categorySlug"
          />
        </div>
        <label
          htmlFor="urgent"
          className="flex flex-row justify-between bg-gray-200 p-2 rounded"
        >
          Urgent
          <input
            type="checkbox"
            name="urgent"
            id="urgent"
            checked={urgent}
            onChange={() => setUrgent(!urgent)}
          />
        </label>
      </form>
      <Modal
        isOpen={isCategoriesOpen}
        onClose={() => setIsCategoriesOpen(false)}
        modalTitle="Change Category"
        isChild
      >
        <ChangeCategoryPopup
          slug={categorySlug}
          setSlug={setCategorySlug}
          onClose={() => setIsCategoriesOpen(false)}
        />
      </Modal>
    </div>
  );
};
