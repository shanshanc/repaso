"use client";

import { useState, useRef } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tag, TagCategory, NewSentence } from "@/lib/types";
import { TagBadge } from "@/components/tags/TagBadge";

const categoryOrder: TagCategory[] = ["tense", "grammar", "verb", "phrase"];
const categoryLabels: Record<TagCategory, string> = {
  tense: "Tenses",
  grammar: "Grammar",
  verb: "Verbs",
  phrase: "Phrases",
};

type SentenceFormProps = {
  tags: Tag[];
  onSubmit: (data: NewSentence) => void;
  onCancel: () => void;
};

type ParsedResponse = {
  sentence: string;
  translation: string;
  suggestedTags: { name: string; category: TagCategory; isExisting: boolean }[];
};

export function SentenceForm({ tags, onSubmit, onCancel }: SentenceFormProps) {
  const [sentence, setSentence] = useState("");
  const [translation, setTranslation] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [newTagName, setNewTagName] = useState("");
  const [newTagCategory, setNewTagCategory] = useState<TagCategory>("verb");
  const [pendingNewTags, setPendingNewTags] = useState<
    { name: string; category: TagCategory }[]
  >([]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  };

  const addNewTag = () => {
    const trimmed = newTagName.trim().toLowerCase();
    if (!trimmed) return;

    const alreadyExists =
      tags.some(
        (t) => t.name.toLowerCase() === trimmed && t.category === newTagCategory
      ) ||
      pendingNewTags.some(
        (t) => t.name.toLowerCase() === trimmed && t.category === newTagCategory
      );

    if (alreadyExists) {
      setNewTagName("");
      return;
    }

    setPendingNewTags((prev) => [
      ...prev,
      { name: trimmed, category: newTagCategory },
    ]);
    setNewTagName("");
  };

  const removePendingTag = (index: number) => {
    setPendingNewTags((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setParseError(null);

    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setParseError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleParseImage = async () => {
    if (!imageFile) return;

    setParsing(true);
    setParseError(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const res = await fetch("/api/parse-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Parse request failed");

      const data: ParsedResponse = await res.json();

      setSentence(data.sentence);
      setTranslation(data.translation);

      // Auto-select existing tags and add new ones
      const nextSelected = new Set(selectedTagIds);
      const nextPending = [...pendingNewTags];

      for (const st of data.suggestedTags) {
        if (st.isExisting) {
          const match = tags.find(
            (t) =>
              t.name.toLowerCase() === st.name.toLowerCase() &&
              t.category === st.category
          );
          if (match) nextSelected.add(match.id);
        } else {
          const alreadyPending = nextPending.some(
            (p) => p.name === st.name && p.category === st.category
          );
          const alreadyExisting = tags.some(
            (t) =>
              t.name.toLowerCase() === st.name.toLowerCase() &&
              t.category === st.category
          );
          if (!alreadyPending && !alreadyExisting) {
            nextPending.push({ name: st.name, category: st.category });
          }
        }
      }

      setSelectedTagIds(nextSelected);
      setPendingNewTags(nextPending);
    } catch (err) {
      console.error("Image parse failed:", err);
      setParseError("Failed to parse image. Please try again.");
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sentence.trim() || !translation.trim()) return;

    onSubmit({
      sentence: sentence.trim(),
      translation: translation.trim(),
      source: "manual",
      tagIds: Array.from(selectedTagIds),
      newTags: pendingNewTags.length > 0 ? pendingNewTags : undefined,
    });
  };

  const groupedTags = new Map<TagCategory, Tag[]>();
  for (const cat of categoryOrder) groupedTags.set(cat, []);
  for (const tag of tags) groupedTags.get(tag.category)?.push(tag);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Image upload + parse */}
      <div className="space-y-2">
        <Label>Screenshot (optional)</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Screenshot preview"
              className="max-h-48 w-full rounded-lg border object-contain bg-muted"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 rounded-full bg-background/80 p-1 hover:bg-background"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-sm text-muted-foreground hover:border-foreground/25 hover:text-foreground transition-colors"
          >
            <ImagePlus className="size-5" />
            Upload a screenshot to auto-fill
          </button>
        )}
        {imageFile && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={handleParseImage}
            disabled={parsing}
          >
            {parsing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Parsing with AI...
              </>
            ) : (
              "Parse screenshot"
            )}
          </Button>
        )}
        {parseError && (
          <p className="text-sm text-destructive">{parseError}</p>
        )}
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="sentence">Spanish sentence</Label>
        <Input
          id="sentence"
          placeholder="Antes de que llegaras..."
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="translation">English translation</Label>
        <Input
          id="translation"
          placeholder="Before you arrived..."
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          required
        />
      </div>

      <Separator />

      <div className="space-y-3">
        <Label>Tags</Label>
        {categoryOrder.map((category) => {
          const catTags = groupedTags.get(category);
          if (!catTags || catTags.length === 0) return null;
          return (
            <div key={category}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {categoryLabels[category]}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {catTags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={selectedTagIds.has(tag.id)}
                      onCheckedChange={() => toggleTag(tag.id)}
                    />
                    <span>{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Add new tag</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addNewTag();
              }
            }}
          />
          <Select
            value={newTagCategory}
            onValueChange={(v) => setNewTagCategory(v as TagCategory)}
          >
            <SelectTrigger className="w-[120px]">
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
          <Button type="button" variant="outline" size="sm" onClick={addNewTag}>
            Add
          </Button>
        </div>
        {pendingNewTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {pendingNewTags.map((tag, i) => (
              <TagBadge
                key={`${tag.name}-${tag.category}`}
                tag={{
                  id: `new-${i}`,
                  name: tag.name,
                  category: tag.category,
                  created_at: "",
                }}
                onRemove={() => removePendingTag(i)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!sentence.trim() || !translation.trim()}>
          Add sentence
        </Button>
      </div>
    </form>
  );
}
