import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSentences } from "@/lib/supabase/queries";

function mockFrom(data: { id: string }[] = []) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data, error: null }),
      in: vi.fn().mockResolvedValue({ data, error: null }),
    }),
  };
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        in: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    }),
  }),
}));
vi.mock("@/lib/supabase/queries", () => ({
  getSentences: vi.fn().mockResolvedValue([]),
}));

function makeRequest(
  params?: Record<string, string>,
  headers?: Record<string, string>
) {
  const url = new URL("http://localhost/api/sentences/search");
  const tag = params?.tag ?? "";
  const q = params?.q ?? "";
  // tag: empty = omit param; string = single name or JSON array of names (route accepts both)
  if (tag) url.searchParams.set("tag", tag);
  if (q) url.searchParams.set("q", q);

  return new NextRequest(url.toString(), {
    method: "GET",
    headers: headers ?? {},
  });
}

describe("GET /api/sentences/search", () => {
  beforeEach(() => {
    process.env.APP_PASSWORD = "test-password";
    process.env.AUTH_SECRET = "test-secret";
    process.env.REPASO_API_KEY = "test-api-key";
  });

  describe("Authorization", () => {
    it("Return 500 status code if missing REPASO_API_KEY", async () => {
      delete process.env.REPASO_API_KEY;

      const res = await GET(makeRequest());
      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ error: "Server misconfigured" });
    });

    it("Return 401 if no authorization header", async () => {
      const res = await GET(makeRequest());
      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: "Unauthorized" });
    });

    it("Return 401 if authorization header format is not bearer token", async () => {
      const res = await GET(makeRequest(undefined, {
        Authorization: "Basic test-api-key",
      }));
      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: "Unauthorized" });
    });

    it("Return 401 if wrong API key", async () => {
      const res = await GET(makeRequest(undefined, {
        Authorization: "Bearer wrong-api-key",
      }));
      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: "Unauthorized" });
    });

    it("Pass authorization header is API key is correct", async () => {
      const res = await GET(makeRequest(undefined, {
        Authorization: "Bearer test-api-key",
      }));
      expect(res.status).toBe(200);
    });

    it("passes retrieved tag ids to getSentences", async () => {
      const retrievedId = "tag-uuid-from-db";
      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn().mockReturnValue(mockFrom([{ id: retrievedId }])),
      } as never);

      await GET(
        makeRequest(
          { tag: JSON.stringify(["verb"]), q: "search" },
          { Authorization: "Bearer test-api-key" }
        )
      );

      expect(getSentences).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ tagIds: [retrievedId] })
      );
    });
  });

  describe("Search", () => {
    it("Return all sentences when there is no parameters", async () => {
      vi.mocked(getSentences).mockResolvedValueOnce([
        {
          id: "a1",
          sentence: "foo",
          translation: "bar",
          source: "manual",
          created_at: "",
          tags: [{ id: "t1", name: "verb", category: "grammar", created_at: "" }],
        },
        {
          id: "a2",
          sentence: "baz",
          translation: "qux",
          source: "manual",
          created_at: "",
          tags: [],
        },
      ]);

      // No tag/q so the route skips tag lookup and calls getSentences directly
      const res = await GET(makeRequest({ tag: "", q: "" }, {
        Authorization: "Bearer test-api-key",
      }));
      const data = await res.json();
      expect(data.sentences).toHaveLength(2);
      expect(data.sentences[0].sentence).toBe("foo");
      expect(data.sentences[1].sentence).toBe("baz");
      expect(data.count).toBe(2);
    });

    it("When there is tag parameter, check tags table first then get sentences", async () => {
      const retrievedId = "tag-verb-id";
      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn().mockReturnValue(mockFrom([{ id: retrievedId }])),
      } as never);
      vi.mocked(getSentences).mockResolvedValueOnce([
        {
          id: "a1",
          sentence: "foo",
          translation: "bar",
          source: "manual",
          created_at: "",
          tags: [{ id: "t1", name: "verb", category: "grammar", created_at: "" }],
        },
      ]);
      const res = await GET(makeRequest({ tag: "verb", q: "" }, {
        Authorization: "Bearer test-api-key",
      }));
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.sentences).toHaveLength(1);
      expect(data.sentences[0].sentence).toBe("foo");
      expect(data.sentences[0].tags).toEqual(["verb"]);
      expect(data.count).toBe(1);
    });

    it("Return empty array when tag does not exist", async () => {
      const res = await GET(makeRequest({ tag: "non-existing-tag", q: "" }, {
        Authorization: "Bearer test-api-key",
      }));
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.sentences).toEqual([]);
      expect(data.count).toBe(0);
    });

    it("accepts multiple tag names as JSON array and passes all tagIds to getSentences", async () => {
      const id1 = "id-verb";
      const id2 = "id-tense";
      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn().mockReturnValue(mockFrom([{ id: id1 }, { id: id2 }])),
      } as never);
      await GET(
        makeRequest(
          { tag: JSON.stringify(["verb", "tense"]), q: "" },
          { Authorization: "Bearer test-api-key" }
        )
      );
      expect(getSentences).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ tagIds: [id1, id2] })
      );
    });

    it("Search sentences by using q param when provided", async () => {
      vi.mocked(getSentences).mockResolvedValueOnce([
        {
          id: "a1",
          sentence: "foo",
          translation: "bar",
          source: "manual",
          created_at: "",
          tags: [{ id: "t1", name: "verb", category: "grammar", created_at: "" }],
        }
      ]);
      const res = await GET(makeRequest({ q: "foo" }, {
        Authorization: "Bearer test-api-key",
      }));
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.sentences).toHaveLength(1);
      expect(data.sentences[0].sentence).toBe("foo");
      expect(data.count).toBe(1);
    });

    it("Search sentences by using both tag and q params when provided", async () => {
      vi.mocked(createClient).mockResolvedValueOnce({
        from: vi.fn().mockReturnValue(mockFrom([{ id: "t1" }])),
      } as never);
      vi.mocked(getSentences).mockResolvedValueOnce([
        {
          id: "a1",
          sentence: "foo",
          translation: "bar",
          source: "manual",
          created_at: "",
          tags: [{ id: "t1", name: "verb", category: "grammar", created_at: "" }],
        }
      ]);
      const res = await GET(makeRequest({ tag: "verb", q: "foo" }, {
        Authorization: "Bearer test-api-key",
      }));
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.sentences).toHaveLength(1);
      expect(data.sentences[0].sentence).toBe("foo");
    });

    it("Return data has the fields of sentence, translation, and tags", async () => {
      vi.mocked(getSentences).mockResolvedValueOnce([
        {
          id: "a1",
          sentence: "foo",
          translation: "bar",
          source: "manual",
          created_at: "",
          tags: [{ id: "t1", name: "verb", category: "grammar", created_at: "" }],
        }
      ]);
      const res = await GET(makeRequest({ q: "foo" }, {
        Authorization: "Bearer test-api-key",
      }));
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.sentences).toHaveLength(1);
      const sentenceKeys = Object.keys(data.sentences[0]);
      expect(sentenceKeys).toContain("sentence");
      expect(sentenceKeys).toContain("translation");
      expect(sentenceKeys).toContain("tags");
    });

    it("Return 500 when getSentences throws an error", async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      try {
        vi.mocked(getSentences).mockRejectedValueOnce(new Error("Failed"));
        const res = await GET(makeRequest({ q: "foo" }, {
          Authorization: "Bearer test-api-key",
        }));

        expect(res.status).toBe(500);
        expect(await res.json()).toEqual({ error: "Failed to search sentences" });
        expect(getSentences).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ search: "foo" })
        );
      } finally {
        consoleError.mockRestore();
      }
    });
  });
});
