import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSentences, createSentence } from "@/lib/supabase/queries";
import { NewSentence } from "@/lib/types";
import { sanitizeText } from "@/lib/sanitize";

function sanitizeSentence(body: NewSentence): NewSentence {
  return {
    ...body,
    sentence: sanitizeText(body.sentence),
    translation: sanitizeText(body.translation),
    tagIds: body.tagIds ?? [],
    newTags: body.newTags?.map((t) => ({
      name: sanitizeText(t.name),
      category: t.category,
    })),
  };
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = request.nextUrl;

  const search = searchParams.get("search") || undefined;
  const tagIds = searchParams.getAll("tagId");

  try {
    const sentences = await getSentences(supabase, {
      search,
      tagIds: tagIds.length > 0 ? tagIds : undefined,
    });
    return NextResponse.json(sentences);
  } catch (error) {
    console.error("GET /api/sentences error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sentences" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const body: NewSentence = await request.json();
    const sanitized = sanitizeSentence(body);
    const sentence = await createSentence(supabase, sanitized);
    return NextResponse.json(sentence, { status: 201 });
  } catch (error) {
    console.error("POST /api/sentences error:", error);
    return NextResponse.json(
      { error: "Failed to create sentence" },
      { status: 500 }
    );
  }
}
