import { describe, it, expect } from "vitest";
import { POST } from "../route";
import { COOKIE_NAME } from "@/lib/auth";

describe("POST /api/auth/logout", () => {
  it("returns 200 with success", async () => {
    const res = await POST();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
  });

  it("clears the auth cookie via Set-Cookie header", async () => {
    const res = await POST();
    const cookie = res.cookies.get(COOKIE_NAME);
    expect(cookie).toBeDefined();
    expect(cookie?.value).toBe("");
  });
});
