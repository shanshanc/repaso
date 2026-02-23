"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Pencil,
  Trash2,
  Merge,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagBadge } from "@/components/tags/TagBadge";
import { Tag, TagCategory } from "@/lib/types";

type TagWithCount = Tag & { sentence_count: number };

const categoryLabels: Record<TagCategory, string> = {
  tense: "Tenses",
  grammar: "Grammar",
  verb: "Verbs",
  phrase: "Phrases",
};

const categoryOrder: TagCategory[] = ["tense", "grammar", "verb", "phrase"];

export default function TagsPage() {
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [mergingId, setMergingId] = useState<string | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState<string>("");

  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch("/api/tags?counts=true");
      const data = await res.json();
      setTags(data);
    } catch (err) {
      console.error("Failed to fetch tags:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleRename = async (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) return;

    try {
      const res = await fetch(`/api/tags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) throw new Error("Failed to rename");
      setEditingId(null);
      await fetchTags();
    } catch (err) {
      console.error("Rename failed:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchTags();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleMerge = async (sourceId: string) => {
    if (!mergeTargetId || mergeTargetId === sourceId) return;

    try {
      const res = await fetch("/api/tags/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId, targetId: mergeTargetId }),
      });
      if (!res.ok) throw new Error("Failed to merge");
      setMergingId(null);
      setMergeTargetId("");
      await fetchTags();
    } catch (err) {
      console.error("Merge failed:", err);
    }
  };

  const grouped = new Map<TagCategory, TagWithCount[]>();
  for (const cat of categoryOrder) grouped.set(cat, []);
  for (const tag of tags) grouped.get(tag.category)?.push(tag);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/sentences">
          <Button variant="ghost" size="icon" className="size-8">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Manage tags</h1>
      </div>

      <div className="space-y-6">
        {categoryOrder.map((category) => {
          const catTags = grouped.get(category) ?? [];
          if (catTags.length === 0) return null;

          return (
            <div key={category}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {categoryLabels[category]}
              </h2>
              <div className="space-y-1">
                {catTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2"
                  >
                    {editingId === tag.id ? (
                      <>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8 flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRename(tag.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => handleRename(tag.id)}
                        >
                          <Check className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </>
                    ) : mergingId === tag.id ? (
                      <>
                        <TagBadge tag={tag} />
                        <span className="text-sm text-muted-foreground">merge into</span>
                        <Select
                          value={mergeTargetId}
                          onValueChange={setMergeTargetId}
                        >
                          <SelectTrigger className="h-8 w-[160px] text-xs">
                            <SelectValue placeholder="Select tag..." />
                          </SelectTrigger>
                          <SelectContent>
                            {tags
                              .filter((t) => t.id !== tag.id)
                              .map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.name} ({t.category})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => handleMerge(tag.id)}
                          disabled={!mergeTargetId}
                        >
                          <Check className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => {
                            setMergingId(null);
                            setMergeTargetId("");
                          }}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <TagBadge tag={tag} className="shrink-0" />
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {tag.sentence_count}
                        </Badge>
                        <div className="flex-1" />
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => {
                              setEditingId(tag.id);
                              setEditName(tag.name);
                            }}
                            title="Rename"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => {
                              setMergingId(tag.id);
                              setMergeTargetId("");
                            }}
                            title="Merge into another tag"
                          >
                            <Merge className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(tag.id)}
                            title="Delete"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
