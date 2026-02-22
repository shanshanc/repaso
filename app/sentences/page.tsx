"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Plus, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SentenceList } from "@/components/sentences/SentenceList";
import { AddSentenceDialog } from "@/components/sentences/AddSentenceDialog";
import { TagFilter } from "@/components/tags/TagFilter";
import { Sentence, Tag, NewSentence } from "@/lib/types";

export default function SentencesPage() {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [sentencesRes, tagsRes] = await Promise.all([
        fetch("/api/sentences"),
        fetch("/api/tags"),
      ]);
      const [sentencesData, tagsData] = await Promise.all([
        sentencesRes.json(),
        tagsRes.json(),
      ]);
      setSentences(sentencesData);
      setTags(tagsData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  };

  const clearAllTags = () => setSelectedTagIds(new Set());

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return sentences.filter((s) => {
      const matchesSearch =
        !q ||
        s.sentence.toLowerCase().includes(q) ||
        s.translation.toLowerCase().includes(q);

      const matchesTags =
        selectedTagIds.size === 0 ||
        Array.from(selectedTagIds).every((tagId) =>
          s.tags.some((t) => t.id === tagId)
        );

      return matchesSearch && matchesTags;
    });
  }, [sentences, search, selectedTagIds]);

  const handleAddSentence = async (data: NewSentence) => {
    try {
      const res = await fetch("/api/sentences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create sentence");

      await fetchData();
    } catch (err) {
      console.error("Failed to add sentence:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-24">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Repaso</h1>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sentences..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <TagFilter
          tags={tags}
          sentences={sentences}
          selectedTagIds={selectedTagIds}
          onToggleTag={toggleTag}
          onClearAll={clearAllTags}
        />
      </div>

      <div className="mt-4">
        <SentenceList sentences={filtered} />
      </div>

      <Button
        size="icon"
        className="fixed bottom-6 right-6 size-14 rounded-full shadow-lg"
        onClick={() => setDialogOpen(true)}
      >
        <Plus className="size-6" />
      </Button>

      <AddSentenceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tags={tags}
        onSubmit={handleAddSentence}
      />
    </div>
  );
}
