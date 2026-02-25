import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getAppUrl } from "./url";

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  delete process.env.NEXT_PUBLIC_APP_URL;
  delete process.env.VERCEL_URL;
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
});

describe("getAppUrl", () => {
  it("returns NEXT_PUBLIC_APP_URL when set", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://example.com";
    expect(getAppUrl()).toBe("https://example.com");
  });

  it("falls back to VERCEL_URL when NEXT_PUBLIC_APP_URL is not set", () => {
    process.env.VERCEL_URL = "quoteflo.vercel.app";
    expect(getAppUrl()).toBe("https://quoteflo.vercel.app");
  });

  it("falls back to localhost when no env vars are set", () => {
    expect(getAppUrl()).toBe("http://localhost:3000");
  });
});

