import { describe, it, expect, vi } from "vitest";
import { PUT, DELETE } from "../route";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/supabase/queries", () => ({
  updateSentence: vi.fn().mockResolvedValue({}),
  deleteSentence: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/auth", () => ({
  verifyAuth: vi.fn().mockResolvedValue(true),
}));

import { verifyAuth } from "@/lib/auth";

const params = Promise.resolve({ id: "test-id" });

function makeRequest(method: string, body?: object) {
  return new NextRequest("http://localhost/api/sentences/test-id", {
    method,
    ...(body && {
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }),
  });
}

describe("PUT /api/sentences/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(verifyAuth).mockResolvedValueOnce(false);

    const res = await PUT(makeRequest("PUT", {
      sentence: "hola",
      translation: "hello",
      tagIds: [],
    }), { params });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });
});

describe("DELETE /api/sentences/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(verifyAuth).mockResolvedValueOnce(false);

    const res = await DELETE(makeRequest("DELETE"), { params });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });
});
