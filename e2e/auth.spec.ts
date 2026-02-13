import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test("displays login form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("invalid@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByText(/Invalid email or password/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test("navigates to signup from login link", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /Start free trial/i }).click();
    await expect(page).toHaveURL("/signup");
  });

  test("navigates to forgot password", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /Forgot password/i }).click();
    await expect(page).toHaveURL("/forgot-password");
  });
});

test.describe("Signup page", () => {
  test("displays trade selection step", async ({ page }) => {
    await page.goto("/signup");

    await expect(page.getByRole("heading", { name: /Create your account/i })).toBeVisible();
    await expect(page.getByPlaceholder("Search trades...")).toBeVisible();
    await expect(page.getByRole("button", { name: /Electrician/i })).toBeVisible();
  });

  test("proceeds to step 2 when selecting a trade", async ({ page }) => {
    await page.goto("/signup");

    await page.getByRole("button", { name: /Electrician/i }).first().click();

    await expect(page.getByLabel("Company / Trading Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByRole("button", { name: /Start 14-Day Free Trial/i })).toBeVisible();
  });

  test("navigates to login from signup link", async ({ page }) => {
    await page.goto("/signup");
    await page.getByRole("link", { name: /Log in/i }).first().click();
    await expect(page).toHaveURL("/login");
  });
});
