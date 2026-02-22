import { SupabaseClient } from "@supabase/supabase-js";
import { Sentence, Tag, TagCategory, NewSentence } from "@/lib/types";

export async function getAllTags(supabase: SupabaseClient): Promise<Tag[]> {
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("category")
    .order("name");

  if (error) throw error;
  return data as Tag[];
}

export async function createTag(
  supabase: SupabaseClient,
  name: string,
  category: TagCategory
): Promise<Tag> {
  const { data, error } = await supabase
    .from("tags")
    .upsert({ name, category }, { onConflict: "name,category" })
    .select()
    .single();

  if (error) throw error;
  return data as Tag;
}

export async function getSentences(
  supabase: SupabaseClient,
  options?: { search?: string; tagIds?: string[] }
): Promise<Sentence[]> {
  let query = supabase
    .from("sentences")
    .select(
      `
      id,
      sentence,
      translation,
      source,
      created_at,
      sentence_tags ( tag_id, tags ( id, name, category, created_at ) )
    `
    )
    .order("created_at", { ascending: false });

  if (options?.search) {
    const q = `%${options.search}%`;
    query = query.or(`sentence.ilike.${q},translation.ilike.${q}`);
  }

  if (options?.tagIds && options.tagIds.length > 0) {
    // For AND filtering: get sentence_ids that have ALL requested tags
    // We query sentence_tags for each tag and intersect
    const { data: junctionRows, error: jErr } = await supabase
      .from("sentence_tags")
      .select("sentence_id, tag_id")
      .in("tag_id", options.tagIds);

    if (jErr) throw jErr;

    // Group by sentence_id and keep only those that have all requested tags
    const countBysentence = new Map<string, number>();
    for (const row of junctionRows) {
      countBysentence.set(
        row.sentence_id,
        (countBysentence.get(row.sentence_id) ?? 0) + 1
      );
    }
    const matchingIds = Array.from(countBysentence.entries())
      .filter(([, count]) => count >= options.tagIds!.length)
      .map(([id]) => id);

    if (matchingIds.length === 0) return [];
    query = query.in("id", matchingIds);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Reshape the joined data into our Sentence type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    id: row.id,
    sentence: row.sentence,
    translation: row.translation,
    source: row.source,
    created_at: row.created_at,
    tags: ((row.sentence_tags ?? []) as any[])
      .map((st) => st.tags)
      .filter(Boolean)
      .sort((a: Tag, b: Tag) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)),
  }));
}

export async function createSentence(
  supabase: SupabaseClient,
  data: NewSentence
): Promise<Sentence> {
  // 1. Create any new tags first
  const newTagIds: string[] = [];
  if (data.newTags && data.newTags.length > 0) {
    for (const nt of data.newTags) {
      const tag = await createTag(supabase, nt.name, nt.category);
      newTagIds.push(tag.id);
    }
  }

  // 2. Insert the sentence
  const { data: sentence, error: sErr } = await supabase
    .from("sentences")
    .insert({
      sentence: data.sentence,
      translation: data.translation,
      source: data.source ?? "manual",
    })
    .select()
    .single();

  if (sErr) throw sErr;

  // 3. Link all tags (existing + newly created)
  const allTagIds = [...data.tagIds, ...newTagIds];
  if (allTagIds.length > 0) {
    const { error: linkErr } = await supabase.from("sentence_tags").insert(
      allTagIds.map((tagId) => ({
        sentence_id: sentence.id,
        tag_id: tagId,
      }))
    );
    if (linkErr) throw linkErr;
  }

  // 4. Re-fetch with joined tags
  const { data: refetched, error: rErr } = await supabase
    .from("sentences")
    .select(
      `
      id,
      sentence,
      translation,
      source,
      created_at,
      sentence_tags ( tag_id, tags ( id, name, category, created_at ) )
    `
    )
    .eq("id", sentence.id)
    .single();

  if (rErr) throw rErr;

  return {
    id: refetched.id,
    sentence: refetched.sentence,
    translation: refetched.translation,
    source: refetched.source,
    created_at: refetched.created_at,
    tags: ((refetched.sentence_tags ?? []) as any[])
      .map((st) => st.tags)
      .filter(Boolean),
  };
}
