import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET, POST } from "@/app/api/db/route";
import fs from "fs";

describe("Integration: /api/db Route Security & Protocol Tests", () => {
  let mockDbData: any;
  let writeCalls: string[] = [];

  beforeEach(() => {
    writeCalls = [];
    mockDbData = {
      _last_updated: 1700000000000,
      _last_cleared: 0,
      categories: [{ id: "cat-1", name: "Box", deleted_at: null }],
      sub_types: [{ id: "sub-1", name: "2 JAR", deleted_at: null }],
      locations: [{ id: "loc-1", name: "Warehouse 1", deleted_at: null }],
      products: [{ id: "prod-1", name: "Gift Box", deleted_at: null }],
      stock: [{ id: "st-1", quantity: 50, deleted_at: null }],
      invoices: [],
      invoice_items: [],
      damaged_stock: [],
      stock_movements: [],
      active_devices: []
    };

    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockImplementation(() => JSON.stringify(mockDbData));
    vi.spyOn(fs, "writeFileSync").mockImplementation((_path, data) => {
      writeCalls.push(String(data));
    });
    vi.spyOn(fs, "statSync").mockReturnValue({ mtimeMs: 1700000000000 } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET Endpoint Protocol & Caching", () => {
    it("returns lightweight 304-style response when x-known-version matches _last_updated", async () => {
      const request = new Request("http://localhost:3000/api/db", {
        headers: {
          "x-known-version": "1700000000000",
          "x-device-id": "DEV-TEST-01",
          "x-username": "superadmin"
        }
      });

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.unmodified).toBe(true);
      expect(json._last_updated).toBe(1700000000000);
      expect(json.products).toBeUndefined(); // Bandwidth saving
    });

    it("registers and heartbeats active device from request headers", async () => {
      const request = new Request("http://localhost:3000/api/db", {
        headers: {
          "x-device-id": "DEV-HEARTBEAT-99",
          "x-username": "anand",
          "x-user-agent": "Vitest Runner Agent",
          "x-ip-address": "127.0.0.1"
        }
      });

      const response = await GET(request);
      const json = await response.json();

      expect(json.active_devices).toBeDefined();
      const device = json.active_devices.find((d: any) => d.deviceId === "DEV-HEARTBEAT-99");
      expect(device).toBeDefined();
      expect(device.username).toBe("anand");
    });
  });

  describe("POST Endpoint Security Boundary (BUG-003)", () => {
    it("rejects POST requests missing a payload key with 400 Bad Request", async () => {
      const request = new Request("http://localhost:3000/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: "something without key" })
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe("Missing key");
    });

    it("REGRESSION TEST (BUG-003): documents vulnerability where unauthenticated callers can overwrite arbitrary database keys", async () => {
      const request = new Request("http://localhost:3000/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "users",
          value: [{ id: "usr-hacker", username: "hacker", role: "super_admin" }]
        })
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      expect(writeCalls.length).toBeGreaterThan(0);
      const lastWrite = JSON.parse(writeCalls[writeCalls.length - 1]);
      expect(lastWrite.users[0].username).toBe("hacker");
    });

    it("handles _clear_all wiping transactional tables but preserving structural data", async () => {
      const clearTime = Date.now();
      const request = new Request("http://localhost:3000/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "_clear_all", value: clearTime })
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      expect(writeCalls.length).toBeGreaterThan(0);
      const savedData = JSON.parse(writeCalls[writeCalls.length - 1]);

      expect(savedData.products).toEqual([]);
      expect(savedData.stock).toEqual([]);
      expect(savedData.categories).toHaveLength(1); // Structural data preserved!
    });
  });
});
