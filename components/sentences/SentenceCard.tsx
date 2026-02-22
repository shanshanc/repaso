import { Card, CardContent } from "@/components/ui/card";
import { TagBadge } from "@/components/tags/TagBadge";
import { Sentence } from "@/lib/types";

type SentenceCardProps = {
  sentence: Sentence;
};

export function SentenceCard({ sentence }: SentenceCardProps) {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="text-base font-medium leading-relaxed">
          {sentence.sentence}
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {sentence.translation}
        </p>
        {sentence.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {sentence.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
