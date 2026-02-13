import { test, expect } from "@playwright/test";

test.describe("Public quote view", () => {
  test("returns 404 for non-existent quote token", async ({ page }) => {
    const invalidToken = "00000000-0000-0000-0000-000000000000";
    const response = await page.goto(`/q/${invalidToken}`);

    expect(response?.status()).toBe(404);
  });
});
