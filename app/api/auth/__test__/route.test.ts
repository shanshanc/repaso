import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

const { mockLimit } = vi.hoisted(() => {
  process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";

  return {
    mockLimit: vi.fn().mockResolvedValue({
      success: true,
      remaining: 4,
      reset: Date.now() + 15 * 60 * 1000,
    }),
  };
});

// mock @upstash/ratelimit and @upstash/redis
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: Object.assign(
    vi.fn().mockImplementation(function () {
      return { limit: mockLimit }
    }),
    {
      slidingWindow: vi.fn().mockReturnValue("mocked-sliding-window")
    }
  ),
}));

vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: vi.fn().mockReturnValue({}),
  },
}));

// POST request helper
function makeRequest(body: object, ip = "127.0.0.1") {
  return new NextRequest("http://localhost/api/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth", () => {
  beforeEach(() => {
    process.env.APP_PASSWORD = "test-password";
    process.env.AUTH_SECRET = "test-secret";
  });
  

  it("Return 200 and set cookie when password is correct", async () => {
    const res = await POST(makeRequest({ password: "test-password" }));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);

    // 確認 cookie 有被設定
    const cookie = res.cookies.get("repaso-auth");
    expect(cookie).toBeDefined();
    expect(cookie?.httpOnly).toBe(true);
  });

  it("Return 401 when password is incorrect", async () => {
    const res = await POST(makeRequest({ password: "wrong-password" }));
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.error).toBe("Invalid password");
  });

  it("Return 500 when environment variables are not set", async () => {
    delete process.env.APP_PASSWORD;

    const res = await POST(makeRequest({ password: "test-password" }));
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.error).toBe("Server misconfigured");
  });

  it("Return 429 and set Retry-After header when rate limit is exceeded", async () => {
    mockLimit.mockResolvedValueOnce(() => ({
      success: false,
      remaining: 0,
      reset: Date.now() + 60 * 1000,
    }));

    const res = await POST(makeRequest({ password: "test-password" }));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeDefined();

    const body = await res.json();
    expect(body.error).toMatch(/too many attempts/i);
  });

  it("Skip rate limit when Upstash environment variables are not set (local/dev only)", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const res = await POST(makeRequest({ password: "test-password" }));
    expect(res.status).toBe(200);
  });
});
