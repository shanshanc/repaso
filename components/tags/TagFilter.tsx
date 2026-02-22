"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TagBadge } from "./TagBadge";
import { Tag, TagCategory, Sentence } from "@/lib/types";
import { cn } from "@/lib/utils";

const categoryLabels: Record<TagCategory, string> = {
  tense: "Tenses",
  grammar: "Grammar",
  verb: "Verbs",
  phrase: "Phrases",
};

const categoryOrder: TagCategory[] = ["tense", "grammar", "verb", "phrase"];

type TagFilterProps = {
  tags: Tag[];
  sentences: Sentence[];
  selectedTagIds: Set<string>;
  onToggleTag: (tagId: string) => void;
  onClearAll: () => void;
};

function getTagCounts(tags: Tag[], sentences: Sentence[]) {
  const counts = new Map<string, number>();
  for (const tag of tags) {
    counts.set(
      tag.id,
      sentences.filter((s) => s.tags.some((t) => t.id === tag.id)).length
    );
  }
  return counts;
}

function groupByCategory(tags: Tag[]) {
  const grouped = new Map<TagCategory, Tag[]>();
  for (const cat of categoryOrder) {
    grouped.set(cat, []);
  }
  for (const tag of tags) {
    grouped.get(tag.category)?.push(tag);
  }
  return grouped;
}

export function TagFilter({
  tags,
  sentences,
  selectedTagIds,
  onToggleTag,
  onClearAll,
}: TagFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tagCounts = getTagCounts(tags, sentences);
  const grouped = groupByCategory(tags);
  const selectedTags = tags.filter((t) => selectedTagIds.has(t.id));

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center gap-2">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5 px-2 text-muted-foreground">
            <ChevronDown
              className={cn("size-4 transition-transform", isOpen && "rotate-180")}
            />
            Filter by tag
          </Button>
        </CollapsibleTrigger>

        {!isOpen && selectedTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {selectedTags.map((tag) => (
              <TagBadge
                key={tag.id}
                tag={tag}
                onRemove={() => onToggleTag(tag.id)}
              />
            ))}
          </div>
        )}
      </div>

      <CollapsibleContent>
        <div className="mt-2 rounded-lg border bg-card p-4 space-y-4">
          {categoryOrder.map((category) => {
            const catTags = grouped.get(category);
            if (!catTags || catTags.length === 0) return null;

            return (
              <div key={category}>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {categoryLabels[category]}
                </h4>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {catTags.map((tag) => {
                    const count = tagCounts.get(tag.id) ?? 0;
                    return (
                      <label
                        key={tag.id}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={selectedTagIds.has(tag.id)}
                          onCheckedChange={() => onToggleTag(tag.id)}
                        />
                        <span>{tag.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({count})
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {selectedTagIds.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-muted-foreground"
            >
              Clear all
            </Button>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
