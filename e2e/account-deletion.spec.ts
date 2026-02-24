import { test, expect } from "@playwright/test";

const E2E_USER_EMAIL = process.env.E2E_TEST_USER_EMAIL;
const E2E_USER_PASSWORD = process.env.E2E_TEST_USER_PASSWORD;

const TEST_PASSWORD = "TestPassword123!";

function getDialog(page: import("@playwright/test").Page) {
  return page.getByRole("alertdialog").or(page.getByRole("dialog"));
}

async function doSignup(page: import("@playwright/test").Page) {
  const timestamp = Date.now();
  const email = `e2e-delete-${timestamp}@example.com`;
  await page.goto("/signup");
  await page.getByRole("button", { name: /Electrician/i }).first().click();
  await page.getByLabel("Company / Trading Name").fill("E2E Delete Test");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /Start 14-Day Free Trial/i }).click();
  const result = await Promise.race([
    page.waitForURL(/\/(dashboard|settings)/, { timeout: 15_000 }).then(() => "ok" as const),
    page
      .getByText(/Please check your email to confirm/i)
      .waitFor({ state: "visible", timeout: 15_000 })
      .then(() => "confirm" as const),
  ]).catch(() => "timeout" as const);
  if (result === "confirm") {
    test.skip(
      true,
      "Supabase requires email confirmation. Unset E2E_TEST_USER_EMAIL/PASSWORD and disable 'Confirm email' in Supabase Auth, or use a confirmed user."
    );
  }
  if (result === "timeout") {
    throw new Error("Signup did not redirect nor show email confirm message within 15s.");
  }
}

async function ensureLoggedInAndGoToSettings(page: import("@playwright/test").Page) {
  if (E2E_USER_EMAIL && E2E_USER_PASSWORD) {
    await page.goto("/login?redirect=/settings");
    await page.getByLabel("Email").fill(E2E_USER_EMAIL);
    await page.getByLabel("Password").fill(E2E_USER_PASSWORD);
    await page.getByRole("button", { name: "Log in" }).click();
    try {
      await page.waitForURL(/\/(dashboard|settings)/, { timeout: 15_000 });
    } catch {
      await doSignup(page);
    }
  } else {
    await doSignup(page);
  }

  await page.goto("/settings");
  const onSettings = await page.waitForURL(/\/settings/, { timeout: 10_000 }).then(() => true).catch(() => false);
  if (!onSettings || page.url().includes("/login")) {
    test.skip(
      true,
      "Session did not persist. Unset E2E_TEST_USER_EMAIL/PASSWORD and disable email confirmation in Supabase to run via signup."
    );
  }
  await expect(page.getByRole("heading", { name: /Delete account/i })).toBeVisible({ timeout: 5_000 });
}

function getPassword() {
  return E2E_USER_PASSWORD ?? TEST_PASSWORD;
}

test.describe("Account deletion (Settings)", () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedInAndGoToSettings(page);
  });

  test("Settings shows Delete account section", async ({ page }) => {
    await page.goto("/settings");
    await expect(
      page.getByRole("heading", { name: /Delete account/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Delete my account/i })
    ).toBeVisible();
  });

  test("schedule deletion then cancel shows normal card again", async ({
    page,
  }) => {
    await page.goto("/settings");
    const password = getPassword();

    await page.getByRole("button", { name: /Delete my account/i }).click();
    await expect(
      page.getByRole("heading", { name: /Delete your account\?/i })
    ).toBeVisible();
    const deleteDialog = getDialog(page);
    await deleteDialog.getByLabel("Your password").fill(password);
    await deleteDialog
      .getByRole("button", { name: "Delete my account", exact: true })
      .click();

    await expect(
      page.getByRole("heading", { name: /Account scheduled for deletion/i })
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole("button", { name: /Cancel deletion/i })
    ).toBeVisible();

    await page.getByRole("button", { name: /Cancel deletion/i }).click();
    await expect(
      page.getByRole("heading", { name: /Cancel account deletion\?/i })
    ).toBeVisible();
    const cancelDialog = getDialog(page);
    await cancelDialog.getByLabel("Your password").fill(password);
    await cancelDialog
      .getByRole("button", { name: "Cancel deletion", exact: true })
      .click();

    await expect(
      page.getByRole("heading", { name: /Account scheduled for deletion/i })
    ).not.toBeVisible({ timeout: 5_000 });
    await expect(
      page.getByRole("button", { name: /Delete my account/i })
    ).toBeVisible();
  });

  test("shows error when password is wrong on schedule deletion", async ({
    page,
  }) => {
    await page.goto("/settings");

    await page.getByRole("button", { name: /Delete my account/i }).click();
    const dialog = getDialog(page);
    await dialog.getByLabel("Your password").fill("wrongpassword");
    await dialog
      .getByRole("button", { name: "Delete my account", exact: true })
      .click();

    await expect(page.getByText(/Invalid password/i)).toBeVisible({
      timeout: 5_000,
    });
  });
});
