import { listItem } from "@/types/list-item";
import { Ref, useState } from "react";

interface ItemEditPopupProps {
  initialData: listItem;
  formRef: Ref<HTMLFormElement>;
}
export const ItemEditPopup = ({ initialData, formRef }: ItemEditPopupProps) => {
  const [name, setName] = useState(initialData.name ?? "");
  const [notes, setNotes] = useState(initialData.notes ?? "");
  const [url, setUrl] = useState(initialData.url ?? "");
  const [urgent, setUrgent] = useState(initialData.urgent);

  return (
    <form ref={formRef} className="text-gray-900">
      <div className="border-1 border-gray-200 rounded p-1 space-y-2">
        <input type="hidden" name="id" id="id" value={initialData.id} />
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
        <input type="checkbox" name="urgent" id="urgent" checked={urgent} onChange={() => setUrgent(!urgent)} />
      </div>
    </form>
  );
};
