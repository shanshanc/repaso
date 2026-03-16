import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateSentence, deleteSentence } from "@/lib/supabase/queries";
import { UpdateSentence } from "@/lib/types";
import { sanitizeText } from "@/lib/sanitize";
import { verifyAuth } from "@/lib/auth";

function sanitizeUpdateSentence(body: UpdateSentence): UpdateSentence {
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();

  try {
    const body: UpdateSentence = await request.json();
    const sanitized = sanitizeUpdateSentence(body);
    const sentence = await updateSentence(supabase, id, sanitized);
    return NextResponse.json(sentence);
  } catch (error) {
    console.error(`PUT /api/sentences/${id} error:`, error);
    return NextResponse.json(
      { error: "Failed to update sentence" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();

  try {
    await deleteSentence(supabase, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/sentences/${id} error:`, error);
    return NextResponse.json(
      { error: "Failed to delete sentence" },
      { status: 500 }
    );
  }
}
