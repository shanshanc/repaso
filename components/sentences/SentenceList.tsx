import { SentenceCard } from "./SentenceCard";
import { Sentence } from "@/lib/types";

type SentenceListProps = {
  sentences: Sentence[];
  isAuthed: boolean;
  onEdit: (sentence: Sentence) => void;
  onDelete: (id: string) => void;
};

export function SentenceList({ sentences, isAuthed, onEdit, onDelete }: SentenceListProps) {
  if (sentences.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No sentences found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sentences.map((sentence) => (
        <SentenceCard
          key={sentence.id}
          sentence={sentence}
          isAuthed={isAuthed}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
