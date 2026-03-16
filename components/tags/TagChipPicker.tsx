"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tag, TagCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const categoryOrder: TagCategory[] = ["tense", "grammar", "topic"];
const categoryLabels: Record<TagCategory, string> = {
  tense: "Tenses",
  grammar: "Grammar",
  topic: "Topics",
};

const selectedColors: Record<TagCategory, string> = {
  tense: "bg-blue-100 text-blue-800 border-blue-300",
  grammar: "bg-amber-100 text-amber-800 border-amber-300",
  topic: "bg-rose-100 text-rose-800 border-rose-300",
};

const unselectedColors: Record<TagCategory, string> = {
  tense: "bg-transparent text-blue-600/60 border-blue-200/60",
  grammar: "bg-transparent text-amber-600/60 border-amber-200/60",
  topic: "bg-transparent text-rose-600/60 border-rose-200/60",
};

type TagChipPickerProps = {
  tags: Tag[];
  selectedTagIds: Set<string>;
  pendingNewTags: { name: string; category: TagCategory }[];
  onToggleTag: (tagId: string) => void;
  onAddNewTag: (name: string, category: TagCategory) => void;
  onRemovePendingTag: (index: number) => void;
};

function groupByCategory(tags: Tag[]) {
  const grouped = new Map<TagCategory, Tag[]>();
  for (const cat of categoryOrder) grouped.set(cat, []);
  for (const tag of tags) grouped.get(tag.category)?.push(tag);
  return grouped;
}

export function TagChipPicker({
  tags,
  selectedTagIds,
  pendingNewTags,
  onToggleTag,
  onAddNewTag,
  onRemovePendingTag,
}: TagChipPickerProps) {
  const [newTagName, setNewTagName] = useState("");
  const [newTagCategory, setNewTagCategory] = useState<TagCategory>("topic");

  const grouped = groupByCategory(tags);

  const handleAddNew = () => {
    const trimmed = newTagName.trim().toLowerCase();
    if (!trimmed) return;

    const alreadyExists =
      tags.some(
        (t) => t.name.toLowerCase() === trimmed && t.category === newTagCategory
      ) ||
      pendingNewTags.some(
        (t) => t.name.toLowerCase() === trimmed && t.category === newTagCategory
      );

    if (alreadyExists) return;

    onAddNewTag(trimmed, newTagCategory);
    setNewTagName("");
  };

  return (
    <div className="space-y-3">
      {categoryOrder.map((category) => {
        const catTags = grouped.get(category) ?? [];
        if (catTags.length === 0 && !pendingNewTags.some((t) => t.category === category)) {
          return null;
        }

        return (
          <div key={category}>
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {categoryLabels[category]}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {catTags.map((tag) => {
                const isSelected = selectedTagIds.has(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => onToggleTag(tag.id)}
                    className="focus-visible:ring-2 focus-visible:ring-ring rounded-full"
                  >
                    <Badge
                      variant="outline"
                      className={cn(
                        "cursor-pointer border font-normal transition-colors",
                        isSelected
                          ? selectedColors[tag.category]
                          : unselectedColors[tag.category]
                      )}
                    >
                      {tag.name}
                    </Badge>
                  </button>
                );
              })}
              {pendingNewTags
                .map((t, i) => ({ ...t, originalIndex: i }))
                .filter((t) => t.category === category)
                .map((tag) => (
                  <button
                    key={`new-${tag.name}-${tag.category}`}
                    type="button"
                    onClick={() => onRemovePendingTag(tag.originalIndex)}
                    className="focus-visible:ring-2 focus-visible:ring-ring rounded-full"
                  >
                    <Badge
                      variant="outline"
                      className={cn(
                        "cursor-pointer border font-normal",
                        selectedColors[tag.category],
                        "border-dashed"
                      )}
                    >
                      {tag.name} &times;
                    </Badge>
                  </button>
                ))}
            </div>
          </div>
        );
      })}

      <div className="flex items-center gap-2">
        <Input
          placeholder="New tag name..."
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddNew();
            }
          }}
          className="h-8 flex-1 text-sm"
        />
        <Select
          value={newTagCategory}
          onValueChange={(v) => setNewTagCategory(v as TagCategory)}
        >
          <SelectTrigger className="h-8 w-[100px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryOrder.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {categoryLabels[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1 px-2"
          onClick={handleAddNew}
          disabled={!newTagName.trim()}
        >
          <Plus className="size-3.5" />
          Add
        </Button>
      </div>
    </div>
  );
}
