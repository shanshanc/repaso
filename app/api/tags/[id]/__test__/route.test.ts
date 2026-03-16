import { describe, it, expect, vi } from "vitest";
import { PATCH, DELETE } from "../route";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/supabase/queries", () => ({
  renameTag: vi.fn().mockResolvedValue({}),
  deleteTag: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/auth", () => ({
  verifyAuth: vi.fn().mockResolvedValue(true),
}));

import { verifyAuth } from "@/lib/auth";

const params = Promise.resolve({ id: "test-id" });

function makeRequest(method: string, body?: object) {
  return new NextRequest("http://localhost/api/tags/test-id", {
    method,
    ...(body && {
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }),
  });
}

describe("PATCH /api/tags/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(verifyAuth).mockResolvedValueOnce(false);

    const res = await PATCH(makeRequest("PATCH", { name: "new-name" }), { params });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });
});

describe("DELETE /api/tags/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(verifyAuth).mockResolvedValueOnce(false);

    const res = await DELETE(makeRequest("DELETE"), { params });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });
});
