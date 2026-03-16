"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search, Loader2, Tags, ArrowDownUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SentenceList } from "@/components/sentences/SentenceList";
import { AddSentenceDialog } from "@/components/sentences/AddSentenceDialog";
import { EditSentenceDialog } from "@/components/sentences/EditSentenceDialog";
import { TagFilter } from "@/components/tags/TagFilter";
import { Sentence, Tag, NewSentence } from "@/lib/types";

type SortOrder = "newest" | "oldest" | "random";

type SentencesClientProps = {
  isAuthed: boolean;
};

export function SentencesClient({ isAuthed }: SentencesClientProps) {
  const router = useRouter();
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [showUntaggedOnly, setShowUntaggedOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
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
    setShowUntaggedOnly(false);
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  };

  const toggleUntagged = () => {
    setShowUntaggedOnly((prev) => !prev);
    setSelectedTagIds(new Set());
  };

  const clearAllFilters = () => {
    setSelectedTagIds(new Set());
    setShowUntaggedOnly(false);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const result = sentences.filter((s) => {
      const matchesSearch =
        !q ||
        s.sentence.toLowerCase().includes(q) ||
        s.translation.toLowerCase().includes(q);

      if (showUntaggedOnly) return matchesSearch && s.tags.length === 0;

      const matchesTags =
        selectedTagIds.size === 0 ||
        Array.from(selectedTagIds).every((tagId) =>
          s.tags.some((t) => t.id === tagId)
        );

      return matchesSearch && matchesTags;
    });

    if (sortOrder === "oldest") {
      return [...result].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }
    if (sortOrder === "random") {
      const shuffled = [...result];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }
    return result;
  }, [sentences, search, selectedTagIds, showUntaggedOnly, sortOrder]);

  const handleAddSentence = async (data: NewSentence) => {
    const res = await fetch("/api/sentences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.status === 401) {
      router.push("/login?returnTo=/sentences");
      return;
    }
    if (!res.ok) {
      console.error("Failed to create sentence");
      return;
    }
    await fetchData();
  };

  const handleEditSentence = async (id: string, data: NewSentence) => {
    const res = await fetch(`/api/sentences/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.status === 401) {
      router.push("/login?returnTo=/sentences");
      return;
    }
    if (!res.ok) {
      console.error("Failed to update sentence");
      return;
    }
    await fetchData();
  };

  const handleDeleteSentence = async (id: string) => {
    const res = await fetch(`/api/sentences/${id}`, { method: "DELETE" });
    if (res.status === 401) {
      router.push("/login?returnTo=/sentences");
      return;
    }
    if (!res.ok) {
      console.error("Failed to delete sentence");
      return;
    }
    await fetchData();
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
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
        <div className="flex items-center gap-1">
          <Link href="/tags">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <Tags className="size-4" />
              Manage tags
            </Button>
          </Link>
          {isAuthed ? (
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Link href="/login?returnTo=/sentences">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>

      <p className="mb-5 text-sm text-muted-foreground">
        Collect, organize, and review Spanish example sentences. Tag by tense,
        grammar, or topic, then search and filter to focus your practice.
      </p>

      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search sentences..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
            <SelectTrigger className="w-[130px] gap-1.5">
              <ArrowDownUp className="size-3.5 shrink-0 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="random">Random</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TagFilter
          tags={tags}
          sentences={sentences}
          selectedTagIds={selectedTagIds}
          onToggleTag={toggleTag}
          onClearAll={clearAllFilters}
          showUntaggedOnly={showUntaggedOnly}
          onToggleUntagged={toggleUntagged}
        />
      </div>

      <div className="mt-4">
        <SentenceList
          sentences={filtered}
          isAuthed={isAuthed}
          onEdit={setEditingSentence}
          onDelete={handleDeleteSentence}
        />
      </div>

      {isAuthed && (
        <Button
          size="icon"
          className="fixed bottom-6 right-6 size-14 rounded-full shadow-lg"
          onClick={() => setAddDialogOpen(true)}
        >
          <Plus className="size-6" />
        </Button>
      )}

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
