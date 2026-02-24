import { describe, it, expect } from "vitest";
import { escapeHtml } from "./utils";

describe("escapeHtml", () => {
  it("escapes < and >", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
    expect(escapeHtml("a>b")).toBe("a&gt;b");
  });

  it("escapes quotes", () => {
    expect(escapeHtml('"hello"')).toBe("&quot;hello&quot;");
    expect(escapeHtml("'x'")).toBe("&#039;x&#039;");
  });

  it("escapes &", () => {
    expect(escapeHtml("a&b")).toBe("a&amp;b");
  });

  it("prevents script injection", () => {
    const xss = '<script>alert(1)</script>';
    expect(escapeHtml(xss)).toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(escapeHtml(xss)).not.toContain("<script>");
  });

  it("prevents img onerror injection", () => {
    const xss = '"><img src=x onerror=alert(1)>';
    expect(escapeHtml(xss)).toContain("&lt;");
    expect(escapeHtml(xss)).not.toMatch(/<img\s+src/);
  });

  it("leaves safe text unchanged", () => {
    expect(escapeHtml("Hello World")).toBe("Hello World");
    expect(escapeHtml("Quote #123")).toBe("Quote #123");
  });
});
