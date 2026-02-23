export type TagCategory = "tense" | "grammar" | "verb" | "phrase";

export type Tag = {
  id: string;
  name: string;
  category: TagCategory;
  created_at: string;
};

export type Sentence = {
  id: string;
  sentence: string;
  translation: string;
  source?: string;
  created_at: string;
  tags: Tag[];
};

export type NewSentence = Omit<Sentence, "id" | "created_at" | "tags"> & {
  tagIds: string[];
  newTags?: { name: string; category: TagCategory }[];
};

export type UpdateSentence = NewSentence;
