import { listItem } from "@/types/list-item";
import { Ref, useState } from "react";

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
  };

  const resolvedInitialData = initialData ?? fallbackData;
  const [name, setName] = useState(resolvedInitialData.name ?? "");
  const [notes, setNotes] = useState(resolvedInitialData.notes ?? "");
  const [url, setUrl] = useState(resolvedInitialData.url ?? "");
  const [urgent, setUrgent] = useState(resolvedInitialData.urgent);

  if (!initialData) {
    return null;
  }

  return (
    <form
      ref={formRef}
      className="text-gray-900"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(new FormData(event.currentTarget));
      }}
    >
      <div className="border-1 border-gray-200 rounded p-1 space-y-2">
        <input type="hidden" name="id" id="id" value={resolvedInitialData.id} />
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
      <div>
        <h2>List select</h2>
      </div>
      <div>
        <h2>Category select</h2>
      </div>
      <div className="space-x-2">
        <label htmlFor="urgent">Urgent</label>
        <input
          type="checkbox"
          name="urgent"
          id="urgent"
          checked={urgent}
          onChange={() => setUrgent(!urgent)}
        />
      </div>
    </form>
  );
};
