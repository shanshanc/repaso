"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Loader2, Tags } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SentenceList } from "@/components/sentences/SentenceList";
import { AddSentenceDialog } from "@/components/sentences/AddSentenceDialog";
import { EditSentenceDialog } from "@/components/sentences/EditSentenceDialog";
import { TagFilter } from "@/components/tags/TagFilter";
import { Sentence, Tag, NewSentence } from "@/lib/types";

export default function SentencesPage() {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingSentence, setEditingSentence] = useState<Sentence | null>(null);
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

  const handleEditSentence = async (id: string, data: NewSentence) => {
    try {
      const res = await fetch(`/api/sentences/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update sentence");
      await fetchData();
    } catch (err) {
      console.error("Failed to update sentence:", err);
    }
  };

  const handleDeleteSentence = async (id: string) => {
    try {
      const res = await fetch(`/api/sentences/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete sentence");
      await fetchData();
    } catch (err) {
      console.error("Failed to delete sentence:", err);
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Repaso</h1>
        <Link href="/tags">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <Tags className="size-4" />
            Manage tags
          </Button>
        </Link>
      </div>

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
        <SentenceList
          sentences={filtered}
          onEdit={setEditingSentence}
          onDelete={handleDeleteSentence}
        />
      </div>

      <Button
        size="icon"
        className="fixed bottom-6 right-6 size-14 rounded-full shadow-lg"
        onClick={() => setAddDialogOpen(true)}
      >
        <Plus className="size-6" />
      </Button>

      <AddSentenceDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        tags={tags}
        onSubmit={handleAddSentence}
      />

      {editingSentence && (
        <EditSentenceDialog
          open={!!editingSentence}
          onOpenChange={(open) => {
            if (!open) setEditingSentence(null);
          }}
          sentence={editingSentence}
          tags={tags}
          onSubmit={handleEditSentence}
        />
      )}
    </div>
  );
}
