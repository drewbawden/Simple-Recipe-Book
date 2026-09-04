import { Dispatch, SetStateAction } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable, isSortable } from "@dnd-kit/react/sortable";
import { AutoScroller } from "@dnd-kit/dom";
import { RestrictToVerticalAxis } from "@dnd-kit/abstract/modifiers";

interface ReorderableItem {
  id: string;
  label: string;
}

interface SortableProps {
  id: string;
  index: number;
  label: string;
}

const Sortable = ({ id, index, label }: SortableProps) => {
  const { ref } = useSortable({
    id,
    index,
    modifiers: [RestrictToVerticalAxis],
  });

  return (
    <li
      ref={ref}
      className="
        relative bg-gray-200 px-2 py-1
        first:rounded-t-xl
        last:rounded-b-xl
        first:last:rounded-xl
        after:absolute after:bottom-0 after:left-3 after:right-3 after:h-px after:bg-black/10
        last:after:hidden
  "
      style={{ touchAction: "pan-y" }}
    >
      {label}
    </li>
  );
};

interface DraggableListProps {
  items: ReorderableItem[];
  setItems: Dispatch<SetStateAction<ReorderableItem[]>>;
  display?: boolean;
}

export const DraggableList = ({
  items,
  setItems,
  display = true,
}: DraggableListProps) => {
  if (!display) return;

  return (
    <DragDropProvider
      plugins={(plugins) => plugins.filter((plugin) => plugin !== AutoScroller)}
      onDragEnd={(event) => {
        if (event.canceled) return;

        const { source } = event.operation;

        if (!isSortable(source)) return;

        const { initialIndex, index } = source;

        if (initialIndex === index) return;

        setItems((currentItems) => {
          const newItems = [...currentItems];

          const [movedItem] = newItems.splice(initialIndex, 1);

          newItems.splice(index, 0, movedItem);

          return newItems;
        });
      }}
    >
      <ul>
        {items.map((item, index) => (
          <Sortable
            key={item.id}
            id={item.id}
            index={index}
            label={item.label}
          />
        ))}
      </ul>
    </DragDropProvider>
  );
};
