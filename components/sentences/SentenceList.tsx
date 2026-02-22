import { SentenceCard } from "./SentenceCard";
import { Sentence } from "@/lib/types";

type SentenceListProps = {
  sentences: Sentence[];
};

export function SentenceList({ sentences }: SentenceListProps) {
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
        <SentenceCard key={sentence.id} sentence={sentence} />
      ))}
    </div>
  );
}
