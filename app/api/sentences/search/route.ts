import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSentences } from "@/lib/supabase/queries";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function verifyApiKey(request: NextRequest): boolean {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;
  const token = header.slice(7);
  return token === process.env.REPASO_API_KEY;
}

export async function GET(request: NextRequest) {
  if (!process.env.REPASO_API_KEY) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  if (!verifyApiKey(request)) {
    return unauthorized();
  }

  const supabase = await createClient();
  const { searchParams } = request.nextUrl;

  const tag = searchParams.get("tag") || undefined;
  const q = searchParams.get("q") || undefined;

  try {
    let tagIds: string[] | undefined;

    if (tag) {
      const { data: matchingTags, error: tagErr } = await supabase
        .from("tags")
        .select("id")
        .eq("name", tag);

      if (tagErr) throw tagErr;

      if (!matchingTags || matchingTags.length === 0) {
        return NextResponse.json({ sentences: [], count: 0 });
      }

      tagIds = matchingTags.map((t) => t.id);
    }

    const results = await getSentences(supabase, {
      search: q,
      tagIds,
    });

    const sentences = results.map((s) => ({
      sentence: s.sentence,
      translation: s.translation,
      tags: s.tags.map((t) => t.name),
    }));

    return NextResponse.json({ sentences, count: sentences.length });
  } catch (error) {
    console.error("GET /api/sentences/search error:", error);
    return NextResponse.json(
      { error: "Failed to search sentences" },
      { status: 500 }
    );
  }
}
