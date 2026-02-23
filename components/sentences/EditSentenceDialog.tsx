"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SentenceForm } from "./SentenceForm";
import { Tag, Sentence, NewSentence } from "@/lib/types";

type EditSentenceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sentence: Sentence;
  tags: Tag[];
  onSubmit: (id: string, data: NewSentence) => void;
};

export function EditSentenceDialog({
  open,
  onOpenChange,
  sentence,
  tags,
  onSubmit,
}: EditSentenceDialogProps) {
  const handleSubmit = (data: NewSentence) => {
    onSubmit(sentence.id, data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit sentence</DialogTitle>
        </DialogHeader>
        <SentenceForm
          tags={tags}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          initialData={{
            sentence: sentence.sentence,
            translation: sentence.translation,
            tagIds: sentence.tags.map((t) => t.id),
          }}
          submitLabel="Save changes"
        />
      </DialogContent>
    </Dialog>
  );
}
