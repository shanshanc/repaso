import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAllTags } from "@/lib/supabase/queries";

export async function GET() {
  const supabase = await createClient();

  try {
    const tags = await getAllTags(supabase);
    return NextResponse.json(tags);
  } catch (error) {
    console.error("GET /api/tags error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}
