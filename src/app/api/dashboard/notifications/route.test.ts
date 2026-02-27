import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";

const mockGetUser = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockUpdate = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

vi.mock("@/lib/data/notifications", () => ({
  getRecentNotifications: vi.fn(() => Promise.resolve([])),
}));

describe("GET /api/dashboard/notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });
    mockSingle.mockResolvedValue({
      data: { notifications_last_seen_at: "2025-01-01T12:00:00Z" },
    });
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await GET();
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns events and lastSeenAt when authenticated", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    const { getRecentNotifications } = await import("@/lib/data/notifications");
    vi.mocked(getRecentNotifications).mockResolvedValue([
      {
        id: "ev-1",
        quoteId: "q1",
        customerName: "Acme",
        quoteNumber: "QF-2025-0001",
        type: "sent",
        at: "2025-01-15T10:00:00Z",
      },
    ]);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toHaveProperty("events");
    expect(data.data).toHaveProperty("lastSeenAt");
    expect(data.data.events).toHaveLength(1);
    expect(typeof data.data.lastSeenAt).toBe("number");
  });
});

describe("POST /api/dashboard/notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      update: mockUpdate,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockResolvedValue({ error: null });
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const req = new Request("http://localhost/api/dashboard/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastSeenAt: Date.now() }),
    });
    const res = await POST(req as import("next/server").NextRequest);
    expect(res.status).toBe(401);
  });

  it("returns 400 when lastSeenAt is invalid", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    const req = new Request("http://localhost/api/dashboard/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastSeenAt: "invalid" }),
    });
    const res = await POST(req as import("next/server").NextRequest);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid lastSeenAt");
  });

  it("returns 200 and updates when lastSeenAt is valid", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    const req = new Request("http://localhost/api/dashboard/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastSeenAt: 1735729200000 }),
    });
    const res = await POST(req as import("next/server").NextRequest);
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith({
      notifications_last_seen_at: expect.any(String),
    });
    expect(mockEq).toHaveBeenCalledWith("id", "user-1");
  });
});
