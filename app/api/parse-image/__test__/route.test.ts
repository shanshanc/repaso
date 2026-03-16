import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/supabase/queries", () => ({
  getAllTags: vi.fn().mockResolvedValue([]),
}));

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {};
    }
  },
}));

vi.mock("@/lib/auth", () => ({
  verifyAuth: vi.fn().mockResolvedValue(true),
}));

import { verifyAuth } from "@/lib/auth";
import { POST } from "../route";

function makeRequest() {
  const formData = new FormData();
  formData.append("image", new Blob(["fake"], { type: "image/png" }), "test.png");
  return new NextRequest("http://localhost/api/parse-image", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/parse-image", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(verifyAuth).mockResolvedValueOnce(false);

    const res = await POST(makeRequest());

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });
});
