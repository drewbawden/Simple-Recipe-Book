import { Dispatch, SetStateAction, useMemo } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable, isSortable } from "@dnd-kit/react/sortable";
import {
  DragDropManager,
  PointerActivationConstraints,
  PointerSensor,
  Scroller,
} from "@dnd-kit/dom";
import { RestrictToVerticalAxis } from "@dnd-kit/abstract/modifiers";
import { GripHorizontalIcon } from "lucide-react";

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
  const { ref, handleRef } = useSortable({
    id,
    index,
    modifiers: [RestrictToVerticalAxis],
  });

  return (
    <li
      ref={ref}
      className="
        relative bg-gray-200 px-2 py-2.5 flex flex-row items-center
        first:rounded-t-xl
        last:rounded-b-xl
        first:last:rounded-xl
        after:absolute after:bottom-0 after:left-3 after:right-3 after:h-px after:bg-black/10
        last:after:hidden
  "
      style={{ touchAction: "pan-y" }}
    >
      {label}
      <button
        ref={handleRef}
        type="button"
        className="absolute right-0 py-2 px-4"
      >
        <GripHorizontalIcon size={24} className="text-gray-500" />
      </button>
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
  const manager = useMemo(() => {
    const nextManager = new DragDropManager({
      sensors: [
        PointerSensor.configure({
          activationConstraints: [
            new PointerActivationConstraints.Delay({
              value: 1,
              tolerance: 10,
            }),
          ],
        }),
      ],
    });

    const scroller = nextManager.registry.plugins.get(Scroller);

    if (scroller) {
      const getScrollableElements = scroller.getScrollableElements;

      scroller.getScrollableElements = () => {
        const elements = getScrollableElements();

        if (!elements) return null;

        const documentScrollElements = new Set<Element>([
          document.body,
          document.documentElement,
        ]);

        if (document.scrollingElement) {
          documentScrollElements.add(document.scrollingElement);
        }

        return new Set(
          [...elements].filter(
            (element) => !documentScrollElements.has(element),
          ),
        );
      };
    }

    return nextManager;
  }, []);

  if (!display) return null;

  return (
    <DragDropProvider
      manager={manager}
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
