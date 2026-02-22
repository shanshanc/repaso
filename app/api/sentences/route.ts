import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSentences, createSentence } from "@/lib/supabase/queries";
import { NewSentence } from "@/lib/types";

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
    const sentence = await createSentence(supabase, body);
    return NextResponse.json(sentence, { status: 201 });
  } catch (error) {
    console.error("POST /api/sentences error:", error);
    return NextResponse.json(
      { error: "Failed to create sentence" },
      { status: 500 }
    );
  }
}
