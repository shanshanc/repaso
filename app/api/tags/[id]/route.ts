import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renameTag, deleteTag } from "@/lib/supabase/queries";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  try {
    const { name } = await request.json();
    const tag = await renameTag(supabase, id, name);
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
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
