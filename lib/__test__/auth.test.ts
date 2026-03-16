import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { computeToken, verifyAuth, COOKIE_NAME } from "../auth";

describe("computeToken", () => {
  it("returns a token", async () => {
    const token = await computeToken("test-secret");
    expect(token).toBeDefined();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("verifyAuth", () => {
  const secret = "test-secret";

  function makeRequest(cookieValue?: string) {
    const headers: Record<string, string> = {};
    if (cookieValue !== undefined) {
      headers["Cookie"] = `${COOKIE_NAME}=${cookieValue}`;
    }
    return new NextRequest("http://localhost/", { headers });
  }

  beforeEach(() => {
    process.env.AUTH_SECRET = secret;
  });

  afterEach(() => {
    delete process.env.AUTH_SECRET;
  });

  it("returns true when cookie matches expected token", async () => {
    const validToken = await computeToken(secret);
    const result = await verifyAuth(makeRequest(validToken));
    expect(result).toBe(true);
  });

  it("returns false when cookie value is wrong", async () => {
    const result = await verifyAuth(makeRequest("wrong-token"));
    expect(result).toBe(false);
  });

  it("returns false when cookie is missing", async () => {
    const result = await verifyAuth(makeRequest());
    expect(result).toBe(false);
  });

  it("returns true when AUTH_SECRET is not set (dev open access)", async () => {
    delete process.env.AUTH_SECRET;
    const result = await verifyAuth(makeRequest());
    expect(result).toBe(true);
  });
});
