import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mergeTags } from "@/lib/supabase/queries";
import { verifyAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!await verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  try {
    const { sourceId, targetId } = await request.json();

    if (!sourceId || !targetId || sourceId === targetId) {
      return NextResponse.json(
        { error: "Invalid source or target tag" },
        { status: 400 }
      );
    }

    await mergeTags(supabase, sourceId, targetId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/tags/merge error:", error);
    return NextResponse.json(
      { error: "Failed to merge tags" },
      { status: 500 }
    );
  }
}
