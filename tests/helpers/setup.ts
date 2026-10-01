import { beforeEach, afterEach, vi } from "vitest";

// In-Memory Storage Mock that guarantees 100% test isolation
class MemoryStorage implements Storage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] || null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

// Global in-memory instances
const memoryLocalStorage = new MemoryStorage();
const memorySessionStorage = new MemoryStorage();

// Ensure window & storage exist in test runtime
if (typeof window !== "undefined") {
  Object.defineProperty(window, "localStorage", {
    value: memoryLocalStorage,
    writable: true
  });
  Object.defineProperty(window, "sessionStorage", {
    value: memorySessionStorage,
    writable: true
  });
}

const getFreshSeed = () => ({
  categories: [
    { id: "cat-seed-1", name: "Seed Base Box", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null }
  ],
  sub_types: [
    { id: "sub-seed-1", category_id: "cat-seed-1", name: "Seed Base Sub", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null }
  ],
  locations: [
    { id: "loc-seed-1", name: "Seed Base Warehouse", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null }
  ],
  products: [
    { id: "prod-seed-1", name: "Seed Base Product", category_id: "cat-seed-1", sub_type_id: "sub-seed-1", photos: [], price: 100, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null }
  ],
  stock: [
    { id: "st-seed-1", product_id: "prod-seed-1", additive_id: null, storage_location_id: "loc-seed-1", quantity: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null }
  ],
  invoices: [
    { id: "inv-seed-1", invoice_number: "INV-2026-001", customer_name: "Seed Customer", total_amount: 100, status: "ordered", issue_date: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null }
  ],
  invoice_items: [
    { id: "ivi-seed-1", invoice_id: "inv-seed-1", product_id: "prod-seed-1", quantity: 1, unit_price: 100, discount: 0, total_price: 100, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null }
  ],
  additives: [
    { id: "add-seed-1", name: "Seed Base Almond", price_per_kg: 800, stock_qty_kg: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null }
  ],
  damaged_stock: [],
  stock_movements: [],
  users: [
    {
      id: "usr-admin",
      username: "superadmin",
      password_hash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
      role: "super_admin",
      rights: { view_stock: true, generate_bill: true, edit_inventory: true },
      created_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      id: "usr-anand",
      username: "anand",
      password_hash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
      role: "operator",
      rights: { view_stock: true, generate_bill: true, edit_inventory: true },
      created_at: new Date().toISOString(),
      deleted_at: null
    }
  ]
});

beforeEach(() => {
  memoryLocalStorage.clear();
  memorySessionStorage.clear();

  // Pre-seed storage with isolated deep clone to prevent fallback mutating module globals
  const seed = getFreshSeed();
  for (const [k, v] of Object.entries(seed)) {
    memoryLocalStorage.setItem(`jenny_creation_${k}`, JSON.stringify(v));
  }

  // Mock global fetch to isolate all /api/db and external calls
  global.fetch = vi.fn().mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url.includes("/api/db")) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          _last_updated: Date.now(),
          _last_cleared: 0,
          active_devices: []
        }),
        headers: new Headers()
      } as Response;
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({})
    } as Response;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  memoryLocalStorage.clear();
  memorySessionStorage.clear();
});
