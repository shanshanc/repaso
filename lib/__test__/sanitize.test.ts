import { describe, it, expect } from "vitest";
import { sanitizeText } from "../sanitize";

describe("sanitize", () => {
  it("removes script tags <>", () => {
    expect(sanitizeText("<script>alert('xss')</script>")).toBe("alert('xss')");
    expect(sanitizeText("<script type='text/javascript'>alert('xss');</script>")).toBe("alert('xss');");
  });

  it("removes HTML tags <>", () => {
    const result = sanitizeText("Hello <b>world</b>");
    expect(result).toBe("Hello world");
  });

  it("removes unsafe attributes", () => {
    const results = sanitizeText("<a href='#' onclick='alert(/xss/)'>click me</a>");
    expect(results).toBe("click me");
  })

  it("removes unsafe form tags", () => {
    const result = sanitizeText("<form action='https://example.com/submit'>Submit</form>");
    expect(result).toBe("Submit");
  });

  it("removes unsafe iframe tags", () => {
    const result = sanitizeText("<iframe src='https://example.com/iframe'></iframe>");
    expect(result).toBe("");
  });

  it("removes unsafe link tags", () => {
    const result = sanitizeText("<a href='https://example.com/link'>Link</a>");
    expect(result).toBe("Link");
  });
});
