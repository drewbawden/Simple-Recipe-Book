export interface ListItem {
  id: number;
  name: string;
  notes?: string;
  url?: string;
  urgent: boolean;
  categorySlug: string;
  tag?: Tag;
}

export interface Tag {
  id: number;
  name: string;
  colour: string;
}

export type EditableTag = Omit<Tag, "id"> & {
  id?: number;
};
