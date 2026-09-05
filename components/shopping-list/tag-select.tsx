import { Tag } from "@/types/list-item";
import { ChevronRightIcon } from "lucide-react";
import { useState } from "react";

interface TagSelectProps {
  tag: Tag | null;
  setTag: React.Dispatch<React.SetStateAction<Tag | null>>;
  availableTags: Tag[] | null;
}
export const TagSelect = ({ tag, setTag, availableTags }: TagSelectProps) => {
  const [isTagOpen, setIsTagOpen] = useState(false);
  const selectedTag =
    availableTags?.find((tagOption) => tagOption.id === tag?.id) ?? null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsTagOpen((open) => !open)}
        className="bg-gray-100 p-2 rounded w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {selectedTag ? (
            <>
              <span
                className="size-4 rounded-full"
                style={{ backgroundColor: selectedTag.colour }}
              />
              <span>{selectedTag.name}</span>
            </>
          ) : (
            <span className="text-gray-500">Select a tag</span>
          )}
        </div>

        <ChevronRightIcon
          size={18}
          className={`transition-transform ${isTagOpen ? "rotate-90" : ""}`}
        />
      </button>

      {isTagOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setTag(null);
              setIsTagOpen(false);
            }}
            className="w-full p-2 flex items-center gap-2 text-left hover:bg-gray-100"
          >
            <span className="size-4 rounded-full border border-gray-300" />
            <span className="text-gray-500">No tag</span>
          </button>

          {availableTags?.map((tagOption) => (
            <button
              key={tagOption.id}
              type="button"
              onClick={() => {
                setTag(tagOption);
                setIsTagOpen(false);
              }}
              className="w-full p-2 flex items-center gap-2 text-left hover:bg-gray-100"
            >
              <span
                className="size-4 rounded-full shrink-0"
                style={{
                  backgroundColor: tagOption.colour,
                }}
              />

              <span>{tagOption.name}</span>

              {tag?.id === tagOption.id && (
                <span className="ml-auto text-sm text-gray-500">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
