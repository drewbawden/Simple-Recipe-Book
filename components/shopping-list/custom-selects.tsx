import { Select } from "@/components/templates/select";
import { Tag } from "@/types/list-item";

interface TagSelectProps {
  tag: Tag | null;
  setTag: (tag: Tag | null) => void;
  availableTags: Tag[] | null;
  placeholder?: string;
  clearLabel?: string;
  containerClass?: string;
}

export const TagSelect = ({
  tag,
  setTag,
  availableTags,
  placeholder = "Select a tag",
  clearLabel = "No tag",
  containerClass,
}: TagSelectProps) => {
  return (
    <Select
      value={tag}
      onChange={setTag}
      options={availableTags ?? []}
      getValue={(tag) => String(tag.id)}
      getLabel={(tag) => tag.name}
      placeholder={placeholder}
      clearLabel={clearLabel}
      containerClass={containerClass}
      renderOption={(tag) => (
        <>
          <span
            className="size-4 rounded-full shrink-0"
            style={{ backgroundColor: tag.colour }}
          />
          <span>{tag.name}</span>
        </>
      )}
    />
  );
};
