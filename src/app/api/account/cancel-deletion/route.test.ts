import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

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

describe("POST /api/account/cancel-deletion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdate.mockResolvedValue({ error: null });
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const req = new Request("http://localhost/api/account/cancel-deletion", {
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
    const req = new Request("http://localhost/api/account/cancel-deletion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req as import("next/server").NextRequest);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Password is required");
  });

  it("returns 401 when password is invalid", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "u@example.com" } },
      error: null,
    });
    mockSignInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });
    const req = new Request("http://localhost/api/account/cancel-deletion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "wrong" }),
    });
    const res = await POST(req as import("next/server").NextRequest);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Invalid password. Please try again.");
  });

  it("returns 200 and clears deletion_scheduled_at when password is valid", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "u@example.com" } },
      error: null,
    });
    mockSignInWithPassword.mockResolvedValue({ error: null });
    const req = new Request("http://localhost/api/account/cancel-deletion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "correct" }),
    });
    const res = await POST(req as import("next/server").NextRequest);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalled();
  });
});
