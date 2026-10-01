import { describe, it, expect, vi, beforeEach } from "vitest";
import { localDB } from "@/lib/mockData";

describe("Integration: Client-Server Sync & Conflict Resolution Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("resolves conflicts by adopting server record when server has newer timestamp", async () => {
    // Local copy has older timestamp
    const localCategories = [
      { id: "cat-sync-1", name: "Local Name", created_at: "2026-01-01T10:00:00.000Z", updated_at: "2026-01-01T10:00:00.000Z", deleted_at: null }
    ];
    localStorage.setItem("jenny_creation_categories", JSON.stringify(localCategories));

    // Server responds with newer timestamp
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        _last_updated: Date.now(),
        categories: [
          { id: "cat-sync-1", name: "Server Newer Name", created_at: "2026-01-01T10:00:00.000Z", updated_at: "2026-06-01T10:00:00.000Z", deleted_at: null }
        ]
      })
    } as any);

    const result = await localDB.syncFromServer();
    expect(result).toBeTruthy();

    const merged = JSON.parse(localStorage.getItem("jenny_creation_categories") || "[]");
    expect(merged[0].name).toBe("Server Newer Name");
  });

  it("resolves conflicts by retaining local record when local has newer timestamp", async () => {
    // Local copy has newer timestamp
    const localCategories = [
      { id: "cat-sync-2", name: "Local Newer Edit", created_at: "2026-01-01T10:00:00.000Z", updated_at: "2026-09-01T10:00:00.000Z", deleted_at: null }
    ];
    localStorage.setItem("jenny_creation_categories", JSON.stringify(localCategories));

    // Server responds with older timestamp
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        _last_updated: Date.now(),
        categories: [
          { id: "cat-sync-2", name: "Stale Server Name", created_at: "2026-01-01T10:00:00.000Z", updated_at: "2026-05-01T10:00:00.000Z", deleted_at: null }
        ]
      })
    } as any);

    await localDB.syncFromServer();

    const merged = JSON.parse(localStorage.getItem("jenny_creation_categories") || "[]");
    expect(merged[0].name).toBe("Local Newer Edit");
  });

  it("guarantees local user accounts are never dropped during synchronization", async () => {
    const localUsers = [
      { id: "usr-local-only", username: "offline_operator", role: "operator", deleted_at: null }
    ];
    localStorage.setItem("jenny_creation_users", JSON.stringify(localUsers));

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        _last_updated: Date.now(),
        users: [{ id: "usr-admin", username: "superadmin", role: "super_admin", deleted_at: null }]
      })
    } as any);

    await localDB.syncFromServer();

    const merged = JSON.parse(localStorage.getItem("jenny_creation_users") || "[]");
    expect(merged.some((u: any) => u.id === "usr-local-only")).toBe(true);
    expect(merged.some((u: any) => u.id === "usr-admin")).toBe(true);
  });
});
