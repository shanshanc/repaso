"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TagBadge } from "@/components/tags/TagBadge";
import { Sentence } from "@/lib/types";

type SentenceCardProps = {
  sentence: Sentence;
  onEdit: (sentence: Sentence) => void;
  onDelete: (id: string) => void;
};

export function SentenceCard({ sentence, onEdit, onDelete }: SentenceCardProps) {
  return (
    <Card className="group">
      <CardContent className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-base font-medium leading-relaxed">
              {sentence.sentence}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {sentence.translation}
            </p>
          </div>
          <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => onEdit(sentence)}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(sentence.id)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
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
