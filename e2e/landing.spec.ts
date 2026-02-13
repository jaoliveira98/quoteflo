import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("displays hero content and key CTAs", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Under 5 Minutes"
    );
    await expect(page.getByRole("link", { name: /Start Free Trial/i })).toBeVisible();
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "Log in" })).toBeVisible();
  });

  test("navigates to signup from hero CTA", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Start 14-Day Free Trial/i }).first().click();
    await expect(page).toHaveURL("/signup");
  });

  test("navigates to login from footer", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("contentinfo").getByRole("link", { name: "Log in" }).click();
    await expect(page).toHaveURL("/login");
  });

  test("displays features and pricing sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /Quote to Cash in 3 Steps/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /QuoteFlo/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Simple, Honest Pricing/i })).toBeVisible();
  });
});
