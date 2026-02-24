import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

describe("GET /api/account/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await GET();
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 200 and JSON export when authenticated", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mockFrom.mockImplementation((table: string) => {
      if (table === "user_profiles") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: "user-1", email: "u@example.com", company_name: "Acme" },
            error: null,
          }),
        };
      }
      if (table === "customers") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      if (table === "quotes") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      if (table === "quote_line_items") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      return {};
    });

    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json");
    expect(res.headers.get("Content-Disposition")).toMatch(/attachment; filename="quoteflo-data-/);
    const body = await res.json();
    expect(body).toHaveProperty("exported_at");
    expect(body).toHaveProperty("profile");
    expect(body).toHaveProperty("customers");
    expect(body).toHaveProperty("quotes");
    expect(Array.isArray(body.customers)).toBe(true);
    expect(Array.isArray(body.quotes)).toBe(true);
  });
});
