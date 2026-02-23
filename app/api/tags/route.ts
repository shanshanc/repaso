import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAllTags, getTagsWithCounts } from "@/lib/supabase/queries";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const withCounts = request.nextUrl.searchParams.get("counts") === "true";

  try {
    const tags = withCounts
      ? await getTagsWithCounts(supabase)
      : await getAllTags(supabase);
    return NextResponse.json(tags);
  } catch (error) {
    console.error("GET /api/tags error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}
