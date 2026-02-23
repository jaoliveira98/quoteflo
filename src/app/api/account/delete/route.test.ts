import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/utils", () => ({ escapeHtml: (s: string) => s }));

const mockGetUser = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
      signInWithPassword: mockSignInWithPassword,
    },
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: mockUpdate,
      })),
    })),
  })),
}));

describe("POST /api/account/delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdate.mockResolvedValue({ error: null });
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const req = new Request("http://localhost/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "somepassword" }),
    });
    const res = await POST(req as import("next/server").NextRequest);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 400 when password is missing", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "u@example.com" } },
      error: null,
    });
    mockSignInWithPassword.mockResolvedValue({ error: null });
    const req = new Request("http://localhost/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req as import("next/server").NextRequest);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Password is required");
  });

  it("returns 400 when body is invalid JSON", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "u@example.com" } },
      error: null,
    });
    const req = new Request("http://localhost/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const res = await POST(req as import("next/server").NextRequest);
    expect(res.status).toBe(400);
  });

  it("returns 401 when password is invalid", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "u@example.com" } },
      error: null,
    });
    mockSignInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });
    const req = new Request("http://localhost/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "wrong" }),
    });
    const res = await POST(req as import("next/server").NextRequest);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Invalid password. Please try again.");
  });

  it("returns 200 and schedules deletion when password is valid", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "u@example.com" } },
      error: null,
    });
    mockSignInWithPassword.mockResolvedValue({ error: null });
    const req = new Request("http://localhost/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "correct" }),
    });
    const res = await POST(req as import("next/server").NextRequest);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.deletion_scheduled_at).toBeDefined();
    const scheduled = new Date(data.deletion_scheduled_at);
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);
    expect(scheduled.getDate()).toBe(in30Days.getDate());
    expect(mockUpdate).toHaveBeenCalled();
  });
});
