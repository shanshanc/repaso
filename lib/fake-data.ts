import { Tag, Sentence } from "./types";

export const fakeTags: Tag[] = [
  { id: "t1", name: "pluscuamperfecto", category: "tense", created_at: "2026-01-01T00:00:00Z" },
  { id: "t2", name: "pretérito", category: "tense", created_at: "2026-01-01T00:00:00Z" },
  { id: "t3", name: "subjuntivo", category: "tense", created_at: "2026-01-01T00:00:00Z" },
  { id: "t4", name: "futuro", category: "tense", created_at: "2026-01-01T00:00:00Z" },
  { id: "t5", name: "imperfecto", category: "tense", created_at: "2026-01-01T00:00:00Z" },
  { id: "t6", name: "ser vs estar", category: "grammar", created_at: "2026-01-01T00:00:00Z" },
  { id: "t7", name: "por vs para", category: "grammar", created_at: "2026-01-01T00:00:00Z" },
  { id: "t8", name: "llegar", category: "verb", created_at: "2026-01-01T00:00:00Z" },
  { id: "t9", name: "hacer", category: "verb", created_at: "2026-01-01T00:00:00Z" },
  { id: "t10", name: "tener", category: "verb", created_at: "2026-01-01T00:00:00Z" },
  { id: "t11", name: "antes de que", category: "phrase", created_at: "2026-01-01T00:00:00Z" },
  { id: "t12", name: "a pesar de", category: "phrase", created_at: "2026-01-01T00:00:00Z" },
  { id: "t13", name: "en cuanto", category: "phrase", created_at: "2026-01-01T00:00:00Z" },
];

export const fakeSentences: Sentence[] = [
  {
    id: "s1",
    sentence: "Antes de que llegaras, ya habíamos comido.",
    translation: "Before you arrived, we had already eaten.",
    source: "manual",
    created_at: "2026-02-01T10:00:00Z",
    tags: [fakeTags[0], fakeTags[7], fakeTags[10]],
  },
  {
    id: "s2",
    sentence: "A pesar de la lluvia, salimos a caminar.",
    translation: "Despite the rain, we went out for a walk.",
    source: "manual",
    created_at: "2026-02-02T10:00:00Z",
    tags: [fakeTags[1], fakeTags[11]],
  },
  {
    id: "s3",
    sentence: "En cuanto tenga tiempo, haré la tarea.",
    translation: "As soon as I have time, I will do the homework.",
    source: "manual",
    created_at: "2026-02-03T10:00:00Z",
    tags: [fakeTags[2], fakeTags[3], fakeTags[8], fakeTags[9], fakeTags[12]],
  },
  {
    id: "s4",
    sentence: "Si hubiera sabido, no habría venido.",
    translation: "If I had known, I would not have come.",
    source: "manual",
    created_at: "2026-02-04T10:00:00Z",
    tags: [fakeTags[0], fakeTags[2]],
  },
  {
    id: "s5",
    sentence: "La casa fue construida por mi abuelo para toda la familia.",
    translation: "The house was built by my grandfather for the whole family.",
    source: "manual",
    created_at: "2026-02-05T10:00:00Z",
    tags: [fakeTags[1], fakeTags[5], fakeTags[6]],
  },
];
