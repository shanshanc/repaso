import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "../route";
import { NextRequest } from "next/server";
import { getSentences, createSentence } from "@/lib/supabase/queries";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({}),
}));


vi.mock("@/lib/supabase/queries", () => ({
  getSentences: vi.fn().mockResolvedValue([]),
  createSentence: vi.fn().mockResolvedValue({
    id: "123",
    sentence: "Hello",
    translation: "World",
  }),
}));

function makeGetRequest(params?: Record<string, string>) {
  const url = new URL("http://localhost/api/sentences");
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return new NextRequest(url.toString(), { method: "GET" });
}

function makePostRequest(body: object) {
  return new NextRequest("http://localhost/api/sentences", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}


describe("GET /api/sentences", () => {
  beforeEach(() => {
    process.env.APP_PASSWORD = "test-password";
    process.env.AUTH_SECRET = "test-secret";
  })

  it("Pass undefined when no parameters are provided", async () => {
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(200);
    expect(getSentences).toHaveBeenCalledWith(expect.anything(), {
      search: undefined,
      tagIds: undefined
    });
  });

  it("Pass search parameter when search is provided", async () => {
    const res = await GET(makeGetRequest({ search: "Hello" }));
    expect(getSentences).toHaveBeenCalledWith(expect.anything(), {
      search: "Hello",
      tagIds: undefined
    });
    expect(res.status).toBe(200);
  });

  it("Pass search and tagIds if both are provided", async () => {
    const res = await GET(makeGetRequest({ search: "Hello", tagId: "123" }));
    expect(res.status).toBe(200);

    expect(getSentences).toHaveBeenCalledWith(expect.anything(), {
      search: "Hello",
      tagIds: ["123"]
    });
  });

  it("Retrieve correct sentences when no parameters are provided", async () => {
    vi.mocked(getSentences).mockResolvedValueOnce([
      { id : "1", sentence: "hola", "translation": "hello", tags: [], created_at: "" }
    ])
    
    expect(getSentences).toHaveBeenCalledWith(expect.anything(), {
      search: undefined,
      tagIds: undefined
    });
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("1");
    expect(body[0].sentence).toBe("hola");
    expect(body[0].translation).toBe("hello");
  });

  it("Return 500 when getSentences throws an error", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      vi.mocked(getSentences).mockRejectedValueOnce(new Error("Failed to fetch sentences"));

      const res = await GET(makeGetRequest());
      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ error: "Failed to fetch sentences" });
    } finally {
      consoleError.mockRestore();
    }
  });
});

describe("POST /api/sentences", () => {
  it("Return 201 when createSentence succeeds", async () => {
    const res = await POST(makePostRequest({
      sentence: "Hello",
      translation: "World",
      tagIds: [],
      newTags: []
    }));

    expect(res.status).toBe(201);
    expect(createSentence).toHaveBeenCalledWith(expect.anything(), {
      sentence: "Hello",
      translation: "World",
      tagIds: [],
      newTags: []
    });
  });

  it("sentence and translation are sanitized", async () => {
    await POST(makePostRequest({
      sentence: "<script>alert('xss')</script>",
      translation: "normal text",
      tagIds: [],
      newTags: []
    }))

    expect(createSentence).toHaveBeenCalledWith(
      expect.anything(), 
      expect.objectContaining({
        sentence: "alert('xss')"
      })
    )
  });

  it("newTags's name is sanitized", async () => {
    await POST(makePostRequest({
      sentence: "<script>alert('xss')</script>",
      translation: "normal text",
      tagIds: [],
      newTags: [{
        name: "<script>alert('xss')</script>",
        category: "test"
      }]
    }))
    expect(createSentence).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        newTags: [{
          name: "alert('xss')",
          category: "test"
        }]
      })
    )
  });

  it("Return 500 when createSentence throws an error", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      vi.mocked(createSentence).mockRejectedValueOnce(new Error("Failed to create sentence"));

      const res = await POST(makePostRequest({
        sentence: "hello",
        translation: "world",
        tagIds: [],
        newTags: []
      }));
      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ error: "Failed to create sentence" });
    } finally {
      consoleError.mockRestore();
    }
  });
});
