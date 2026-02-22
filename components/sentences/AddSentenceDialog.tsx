"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SentenceForm } from "./SentenceForm";
import { Tag, NewSentence } from "@/lib/types";

type AddSentenceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: Tag[];
  onSubmit: (data: NewSentence) => void;
};

export function AddSentenceDialog({
  open,
  onOpenChange,
  tags,
  onSubmit,
}: AddSentenceDialogProps) {
  const handleSubmit = (data: NewSentence) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add sentence</DialogTitle>
        </DialogHeader>
        <SentenceForm
          tags={tags}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
