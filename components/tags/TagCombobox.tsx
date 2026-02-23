"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tag, TagCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const categoryOrder: TagCategory[] = ["tense", "grammar", "verb", "phrase"];
const categoryLabels: Record<TagCategory, string> = {
  tense: "Tenses",
  grammar: "Grammar",
  verb: "Verbs",
  phrase: "Phrases",
};

type TagComboboxProps = {
  tags: Tag[];
  selectedTagIds: Set<string>;
  pendingNewTags: { name: string; category: TagCategory }[];
  onToggleTag: (tagId: string) => void;
  onAddNewTag: (name: string, category: TagCategory) => void;
};

export function TagCombobox({
  tags,
  selectedTagIds,
  pendingNewTags,
  onToggleTag,
  onAddNewTag,
}: TagComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newTagCategory, setNewTagCategory] = useState<TagCategory>("verb");

  const trimmed = search.trim().toLowerCase();

  const exactMatch = trimmed
    ? tags.some((t) => t.name.toLowerCase() === trimmed) ||
      pendingNewTags.some((t) => t.name.toLowerCase() === trimmed)
    : true;

  const grouped = new Map<TagCategory, Tag[]>();
  for (const cat of categoryOrder) grouped.set(cat, []);
  for (const tag of tags) grouped.get(tag.category)?.push(tag);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {selectedTagIds.size + pendingNewTags.length > 0
              ? `${selectedTagIds.size + pendingNewTags.length} tag(s) selected`
              : "Search or add tags..."}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search tags..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty className="py-2 text-center text-sm text-muted-foreground">
                No tags found.
              </CommandEmpty>
              {categoryOrder.map((category) => {
                const catTags = grouped.get(category) ?? [];
                const filtered = trimmed
                  ? catTags.filter((t) =>
                      t.name.toLowerCase().includes(trimmed)
                    )
                  : catTags;
                if (filtered.length === 0) return null;

                return (
                  <CommandGroup key={category} heading={categoryLabels[category]}>
                    {filtered.map((tag) => (
                      <CommandItem
                        key={tag.id}
                        value={`${tag.name}-${tag.category}`}
                        onSelect={() => onToggleTag(tag.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 size-4",
                            selectedTagIds.has(tag.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {tag.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}

              {trimmed && !exactMatch && (
                <CommandGroup heading="Create new">
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <Select
                      value={newTagCategory}
                      onValueChange={(v) => setNewTagCategory(v as TagCategory)}
                    >
                      <SelectTrigger className="h-8 w-[110px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOrder.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 flex-1 justify-start gap-1.5 text-sm"
                      onClick={() => {
                        onAddNewTag(trimmed, newTagCategory);
                        setSearch("");
                      }}
                    >
                      <Plus className="size-3.5" />
                      Create &quot;{trimmed}&quot;
                    </Button>
                  </div>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
