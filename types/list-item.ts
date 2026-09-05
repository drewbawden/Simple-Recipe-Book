export interface ListItem {
  id: number;
  name: string;
  notes?: string;
  url?: string;
  urgent: boolean;
  categorySlug: string;
}

export interface Tag {
  name: string;
  colour: string;
}
