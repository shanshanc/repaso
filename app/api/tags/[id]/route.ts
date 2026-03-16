import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renameTag, deleteTag } from "@/lib/supabase/queries";
import { sanitizeText } from "@/lib/sanitize";
import { verifyAuth } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();

  try {
    const { name } = await request.json();
    const sanitizedName = sanitizeText(name ?? "");
    const tag = await renameTag(supabase, id, sanitizedName);
    return NextResponse.json(tag);
  } catch (error) {
    console.error(`PATCH /api/tags/${id} error:`, error);
    return NextResponse.json(
      { error: "Failed to rename tag" },
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
    await deleteTag(supabase, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/tags/${id} error:`, error);
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    );
  }
}
