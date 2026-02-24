import { test, expect } from "@playwright/test";

const XSS_TEST_TOKEN = process.env.TEST_XSS_QUOTE_TOKEN;

test.describe("Public quote view", () => {
  test("returns 404 for non-existent quote token", async ({ page }) => {
    const invalidToken = "00000000-0000-0000-0000-000000000000";
    const response = await page.goto(`/q/${invalidToken}`);

    expect(response?.status()).toBe(404);
  });
});

test.describe("Quote API (IDOR)", () => {
  test("DELETE /api/quotes/[id] returns 401 when unauthenticated", async ({
    request,
  }) => {
    const res = await request.delete(
      "/api/quotes/00000000-0000-0000-0000-000000000000"
    );
    expect(res.status()).toBe(401);
  });
});

test.describe("XSS on public quote", () => {
  test("public PDF API escapes customer name and does not execute script", async ({
    request,
  }) => {
    test.skip(!XSS_TEST_TOKEN, "Set TEST_XSS_QUOTE_TOKEN (run supabase/seed_xss_test_quote.sql) to run");

    const res = await request.get(
      `/api/quotes/pdf/public?token=${encodeURIComponent(XSS_TEST_TOKEN)}`
    );
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("&lt;script&gt;");
    expect(body).not.toContain("<script>alert(1)</script>");
    expect(body).not.toMatch(/<script[\s>]/);
  });
});
