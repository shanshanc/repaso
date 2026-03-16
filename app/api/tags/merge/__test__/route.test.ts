import { describe, it, expect, vi } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/supabase/queries", () => ({
  mergeTags: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/auth", () => ({
  verifyAuth: vi.fn().mockResolvedValue(true),
}));

import { verifyAuth } from "@/lib/auth";

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/tags/merge", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/tags/merge", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(verifyAuth).mockResolvedValueOnce(false);

    const res = await POST(makeRequest({ sourceId: "a", targetId: "b" }));

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });
});
