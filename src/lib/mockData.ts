import { supabase, isSupabaseConfigured } from "./supabase";
import dbJson from "../../database.json";
// Mock Database and Client Service for local mode (with localStorage persistence)
// Mimics PostgreSQL relational schema and soft deletes

export interface User {
  id: string;
  username: string;
  password_hash: string;
  role: "super_admin" | "operator";
  rights: {
    view_stock: boolean;
    generate_bill: boolean;
    edit_inventory: boolean;
  };
  created_at: string;
  updated_at?: string;
  deleted_at: string | null;
  require_password_change?: boolean;
  current_session_token?: string | null;
}

const initialUsers: User[] = [
  {
    id: "usr-admin",
    username: "superadmin",
    password_hash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3", // SHA-256 of 123
    role: "super_admin",
    rights: {
      view_stock: true,
      generate_bill: true,
      edit_inventory: true
    },
    created_at: "2026-08-26T14:10:00.000Z",
    deleted_at: null,
    require_password_change: false,
    current_session_token: null
  },
  {
    id: "usr-anand",
    username: "anand",
    password_hash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
    role: "operator",
    rights: {
      view_stock: true,
      generate_bill: true,
      edit_inventory: true
    },
    created_at: "2026-09-01T13:06:29.216Z",
    deleted_at: null,
    require_password_change: false,
    current_session_token: null
  },
  {
    id: "usr-krupa",
    username: "krupa",
    password_hash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
    role: "operator",
    rights: {
      view_stock: true,
      generate_bill: true,
      edit_inventory: true
    },
    created_at: "2026-09-01T13:06:29.216Z",
    deleted_at: null,
    require_password_change: false,
    current_session_token: null
  },
  {
    id: "usr-jenny",
    username: "jenny",
    password_hash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
    role: "operator",
    rights: {
      view_stock: true,
      generate_bill: true,
      edit_inventory: true
    },
    created_at: "2026-09-01T13:06:29.216Z",
    deleted_at: null,
    require_password_change: false,
    current_session_token: null
  }
];

export interface SellerSettings {
  seller_name: string;
  seller_address: string;
  gstin: string;
  pan: string;
  show_gst_pan: boolean;
  invoice_terms?: string;
  invoice_footer?: string;
  logo_url?: string;
  auto_lock_minutes?: number;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SubType {
  id: string;
  category_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  sub_type_id: string;
  photos: string[]; // URLs
  price?: number; // Selling price
  supplier_code?: string; // Supplier code (alphanumeric, optional)
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  username: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface TrashBinItem {
  id: string;
  type: "product" | "category" | "sub_type" | "location" | "additive" | "invoice";
  name: string;
  deleted_at: string;
}

export interface StorageLocation {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Stock {
  id: string;
  product_id: string | null;
  additive_id: string | null;
  storage_location_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Additive {
  id: string;
  name: string;
  price_per_kg: number;
  stock_qty_kg: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface JarCustomization {
  jar_number: number;
  additive_id: string; // Additive ID or "empty"
  weight_grams: number;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string | null;
  additive_id?: string | null;
  quantity: number;
  unit_price: number;
  discount?: number; // Discount percentage (0 to 100)
  total_price: number;
  customizations?: JarCustomization[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DamagedStock {
  id: string;
  product_id: string | null;
  additive_id: string | null;
  storage_location_id: string;
  quantity: number;
  reported_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone?: string;
  total_amount: number;
  status: "ordered" | "preparing" | "completed" | "delivered";
  order_id: string; // Unique order ID (ORD-2026-XXXXX)
  delivery_date?: string;
  advance_paid?: number;
  payment_mode?: string; // cash, upi, bank, card etc
  issue_date: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  items?: InvoiceItem[];
  device_info?: any;
  created_by_user_id?: string;
  created_by_username?: string;
}

export interface StockMovement {
  id: string;
  item_name: string;
  item_type: "product" | "dryfruit";
  quantity: number;
  movement_type: "added" | "removed" | "transferred" | "damaged";
  from_location_name?: string;
  to_location_name?: string;
  operator_name: string;
  timestamp: string;
}

// Initial seed data
// Initial seed data from database.json or fallback
const initialCategories: Category[] = (dbJson && Array.isArray((dbJson as any).categories) && (dbJson as any).categories.length > 0)
  ? (dbJson as any).categories
  : [
      { id: "cat-1", name: "Box", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
      { id: "cat-2", name: "Puttha", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
      { id: "cat-3", name: "Laser Cutting", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
      { id: "cat-4", name: "Basket", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
    ];

const initialSubTypes: SubType[] = (dbJson && Array.isArray((dbJson as any).sub_types) && (dbJson as any).sub_types.length > 0)
  ? (dbJson as any).sub_types
  : [
      { id: "sub-1", category_id: "cat-1", name: "2 JAR", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
      { id: "sub-2", category_id: "cat-2", name: "6 Box", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
      { id: "sub-3", category_id: "cat-3", name: "Peacock Design", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
      { id: "sub-4", category_id: "cat-4", name: "Peacock Design", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
    ];

const initialLocations: StorageLocation[] = (dbJson && Array.isArray((dbJson as any).locations) && (dbJson as any).locations.length > 0)
  ? (dbJson as any).locations
  : [
      { id: "loc-1", name: "Warehouse 1", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
      { id: "loc-2", name: "Warehouse 2", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
      { id: "loc-3", name: "Warehouse 3", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
      { id: "loc-4", name: "Warehouse 4", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
      { id: "loc-5", name: "Display", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
    ];

const initialProducts: Product[] = (dbJson && Array.isArray((dbJson as any).products) && (dbJson as any).products.length > 0)
  ? (dbJson as any).products
  : [
      {
        id: "prod-1",
        name: "2 JAR Gift Box",
        category_id: "cat-1",
        sub_type_id: "sub-1",
        photos: ["/gift_box_2jar.jpg"],
        price: 450,
        supplier_code: "SUP-BOX-02J",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      }
    ];

const initialStock: Stock[] = (dbJson && Array.isArray((dbJson as any).stock) && (dbJson as any).stock.length > 0)
  ? (dbJson as any).stock
  : [];

const initialInvoices: Invoice[] = [];
const initialInvoiceItems: InvoiceItem[] = [];

const initialAdditives: Additive[] = (dbJson && Array.isArray((dbJson as any).additives) && (dbJson as any).additives.length > 0)
  ? (dbJson as any).additives
  : [];

const initialDamagedStock: DamagedStock[] = [];

const memoryStore: { [key: string]: any } = {};

// Helper to get from localstorage or use defaults
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") {
    if (memoryStore[key] !== undefined) {
      return JSON.parse(JSON.stringify(memoryStore[key]));
    }
    return JSON.parse(JSON.stringify(defaultValue));
  }
  try {
    const item = window.localStorage.getItem(`jenny_creation_${key}`);
    if (item) {
      const parsed = JSON.parse(item);
      if (Array.isArray(parsed) && parsed.length === 0 && Array.isArray(defaultValue) && defaultValue.length > 0) {
        return JSON.parse(JSON.stringify(defaultValue));
      }
      return parsed;
    }
    return JSON.parse(JSON.stringify(defaultValue));
  } catch (error) {
    return JSON.parse(JSON.stringify(defaultValue));
  }
};

const pruneLegacyBase64Images = (): void => {
  if (typeof window === "undefined") return;
  try {
    const rawProducts = window.localStorage.getItem("jenny_creation_products");
    if (rawProducts && rawProducts.includes("data:image/")) {
      const prods = JSON.parse(rawProducts);
      if (Array.isArray(prods)) {
        const cleaned = prods.map((p: any) => {
          if (Array.isArray(p.photos)) {
            const sanitizedPhotos = p.photos.map((url: string) => 
              typeof url === "string" && url.startsWith("data:image/") && url.length > 200000 ? "/gift_box_2jar.jpg" : url
            );
            return { ...p, photos: sanitizedPhotos };
          }
          return p;
        });
        window.localStorage.setItem("jenny_creation_products", JSON.stringify(cleaned));
      }
    }
  } catch (e) {}
};

const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window === "undefined") {
    memoryStore[key] = JSON.parse(JSON.stringify(value));
    return;
  }
  const jsonStr = JSON.stringify(value);
  const storageKey = `jenny_creation_${key}`;

  try {
    window.localStorage.setItem(storageKey, jsonStr);
  } catch (error) {
    pruneLegacyBase64Images();

    try {
      window.localStorage.setItem(storageKey, jsonStr);
    } catch (retryError) {
      try {
        window.sessionStorage.setItem(storageKey, jsonStr);
      } catch (sessionErr) {}
    }
  }

  // Post to server JSON database file (only when running in a browser context)
  if (typeof window !== "undefined" && window.location && window.location.pathname) {
    setTimeout(async () => {
      try {
        const deviceId = window.localStorage.getItem("jenny_device_fingerprint_id") || "DEV-CLIENT";
        let username = "Guest";
        let userRole = "operator";
        try {
          const sessionUser = window.localStorage.getItem("jenny_session_user") || window.sessionStorage.getItem("jenny_session_user");
          if (sessionUser) {
            const parsed = JSON.parse(sessionUser);
            if (parsed && parsed.username) username = parsed.username;
            if (parsed && parsed.role) userRole = parsed.role;
          }
        } catch (err) {}

        const res = await fetch("/api/db", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-device-id": deviceId,
            "x-username": username,
            "x-user-role": userRole,
            "x-user-agent": typeof navigator !== "undefined" ? navigator.userAgent : "Browser"
          },
          body: JSON.stringify({ key, value })
        });
        if (res.ok) {
          try {
            const resData = await res.json();
            if (resData && resData._last_updated) {
              try {
                window.localStorage.setItem("jenny_db_last_known_version", String(resData._last_updated));
              } catch (e) {}
            }
          } catch (e) {}
        }
      } catch (e) {}
    }, 0);
  }

  // Asynchronously update Supabase if configured
  setTimeout(() => {
    try {
      if (localDB && typeof localDB.syncToSupabase === "function") {
        localDB.syncToSupabase(key, value);
      }
    } catch (e) {}
  }, 0);
};

// Database state management
class LocalDB {
  async syncFromServer(): Promise<{ ok: boolean; updated: boolean } | boolean> {
    if (typeof window === "undefined" || !window.location || !window.location.pathname) return false;
    try {
      const deviceId = window.localStorage.getItem("jenny_device_fingerprint_id") || "DEV-UNKNOWN";
      let username = "Guest";
      let userRole = "operator";
      try {
        const sessionUser = window.localStorage.getItem("jenny_session_user") || window.sessionStorage.getItem("jenny_session_user");
        if (sessionUser) {
          const parsed = JSON.parse(sessionUser);
          if (parsed && parsed.username) username = parsed.username;
          if (parsed && parsed.role) userRole = parsed.role;
        }
      } catch (err) {}

      const lastKnownVersion = window.localStorage.getItem("jenny_db_last_known_version") || "0";

      const res = await fetch("/api/db", {
        headers: {
          "x-device-id": deviceId,
          "x-username": username,
          "x-user-agent": navigator.userAgent,
          "x-known-version": lastKnownVersion
        }
      });
      if (!res.ok) return false;
      const serverData = await res.json();
      
      if (serverData && serverData.active_devices) {
        window.localStorage.setItem("jenny_creation_active_devices", JSON.stringify(serverData.active_devices));
      }

      const localLastCleared = Number(window.localStorage.getItem("jenny_last_cleared_at") || "0");
      const serverLastCleared = Number(serverData._last_cleared || "0");

      if (serverLastCleared > localLastCleared) {
        window.localStorage.setItem("jenny_last_cleared_at", String(serverLastCleared));
        // Only wipe test transactional data, PRESERVE structural data (categories, sub_types, locations, additives, users)
        const keysToWipe = [
          "products",
          "stock",
          "damaged_stock",
          "invoices",
          "invoice_items",
          "stock_movements"
        ];
        for (const k of keysToWipe) {
          window.localStorage.setItem(`jenny_creation_${k}`, JSON.stringify([]));
        }
      }

      // If server confirms data is unmodified, skip heavy merging and return early
      if (serverData && serverData.unmodified === true) {
        return { ok: true, updated: false };
      }

      if (serverData && serverData._last_updated) {
        window.localStorage.setItem("jenny_db_last_known_version", String(serverData._last_updated));
      }

      const keysToSync = [
        "users",
        "categories",
        "sub_types",
        "locations",
        "products",
        "stock",
        "additives",
        "damaged_stock",
        "invoices",
        "invoice_items",
        "stock_movements"
      ];

      let anyUpdated = false;

      for (const key of keysToSync) {
        const localItem = window.localStorage.getItem(`jenny_creation_${key}`);
        const localList = localItem ? JSON.parse(localItem) : [];
        const serverList = serverData[key] || [];

        if (!Array.isArray(localList) || !Array.isArray(serverList)) continue;
        if (localList.length === 0 && serverList.length === 0) continue;

        // Merge records by ID
        const map = new Map();
        for (const item of serverList) {
          if (item && item.id) map.set(item.id, item);
        }
        for (const item of localList) {
          if (!item || !item.id) continue;
          const existing = map.get(item.id);
          if (!existing) {
            // For "users", ALWAYS keep local users so user accounts are never lost or dropped
            if (key === "users") {
              map.set(item.id, item);
            } else {
              // For data catalog entities, do NOT resurrect items deleted before serverLastCleared
              const localCreated = new Date(item.created_at || item.updated_at || 0).getTime();
              if (serverLastCleared === 0 || localCreated > serverLastCleared) {
                map.set(item.id, item);
              }
            }
          } else {
            // Compare timestamps
            const localTime = new Date(item.deleted_at || item.updated_at || item.created_at || 0).getTime();
            const serverTime = new Date(existing.deleted_at || existing.updated_at || existing.created_at || 0).getTime();
            if (localTime > serverTime) {
              map.set(item.id, item);
            }
          }
        }

        const mergedList = Array.from(map.values());
        
        if (JSON.stringify(localList) !== JSON.stringify(mergedList)) {
          anyUpdated = true;
          window.localStorage.setItem(`jenny_creation_${key}`, JSON.stringify(mergedList));
        }

        // If server data was different/outdated, upload merged copy
        if (JSON.stringify(serverList) !== JSON.stringify(mergedList)) {
          const postRes = await fetch("/api/db", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "x-device-id": deviceId,
              "x-username": username,
              "x-user-role": userRole,
              "x-user-agent": navigator.userAgent
            },
            body: JSON.stringify({ key, value: mergedList })
          });
          try {
            const postData = await postRes.json();
            if (postData && postData._last_updated) {
              window.localStorage.setItem("jenny_db_last_known_version", String(postData._last_updated));
            }
          } catch (e) {}
        }
      }
      return { ok: true, updated: anyUpdated };
    } catch (e: any) {
      if (e instanceof Error && e.message === "Failed to fetch") {
        console.warn("Local JSON database server sync is temporarily offline (Failed to fetch).");
      } else {
        console.error("Local JSON database server sync failed:", e);
      }
      return false;
    }
  }

  async syncToSupabase(key: string, data: any): Promise<void> {
    if (typeof window === "undefined") return;
    const client = supabase;
    if (!isSupabaseConfigured || !client) return;
    try {
      let tableName = key;
      if (key === "locations") tableName = "storage_locations";
      const records = Array.isArray(data) ? data : [data];
      if (records.length === 0) return;

      if (key === "users") {
        const cleanUsers = records.map(({ updated_at, ...rest }: any) => {
          const cleanObj: any = {};
          for (const k of Object.keys(rest)) {
            cleanObj[k] = rest[k] === undefined ? null : rest[k];
          }
          return cleanObj;
        });
        if (cleanUsers.length > 0) {
          try {
            await client.from("users").upsert(cleanUsers, { onConflict: "id", ignoreDuplicates: true });
          } catch (e) {}
        }
        return;
      }

      if (key === "seller_settings") {
        const record = Array.isArray(data) ? data[0] : data;
        if (record) {
          try {
            await client.from("seller_settings").upsert({
              id: "default",
              seller_name: record.seller_name,
              seller_address: record.seller_address,
              gstin: record.gstin,
              pan: record.pan,
              show_gst_pan: record.show_gst_pan,
              updated_at: new Date().toISOString()
            }, { onConflict: "id" });
          } catch (e) {}
        }
        return;
      }

      if (key === "stock") {
        // Filter valid product stock items and remove additive_id to prevent PostgREST REST 400 errors
        const productStock = records
          .filter(r => r && r.product_id != null && r.product_id !== "")
          .map(({ additive_id, ...rest }) => {
            const cleanObj: any = {};
            for (const k of Object.keys(rest)) {
              cleanObj[k] = rest[k] === undefined ? null : rest[k];
            }
            return cleanObj;
          });

        if (productStock.length > 0) {
          try {
            await client.from("stock").upsert(productStock, { onConflict: "id", ignoreDuplicates: true });
          } catch (e) {}
        }
        return;
      }

      if (key === "invoices") {
        const map = new Map<string, any>();
        records.forEach((inv: any) => {
          if (!inv || !inv.id) return;
          const cleanInv = {
            id: inv.id,
            invoice_number: inv.invoice_number,
            customer_name: inv.customer_name || "Walk-in Customer",
            customer_phone: inv.customer_phone || "N/A",
            total_amount: Number(inv.total_amount) || 0,
            status: inv.status || "ordered",
            delivery_date: inv.delivery_date || null,
            advance_paid: Number(inv.advance_paid) || 0,
            payment_mode: inv.payment_mode || "Cash",
            created_by_user_id: inv.created_by_user_id || null,
            created_by_username: inv.created_by_username || null,
            device_ip: inv.device_ip || null,
            device_fingerprint: inv.device_fingerprint || null,
            created_at: inv.created_at || new Date().toISOString(),
            updated_at: inv.updated_at || new Date().toISOString(),
            deleted_at: inv.deleted_at || null
          };
          const keyName = cleanInv.invoice_number ? cleanInv.invoice_number : cleanInv.id;
          if (!map.has(keyName)) {
            map.set(keyName, cleanInv);
          }
        });
        const cleanInvoices = Array.from(map.values());
        if (cleanInvoices.length > 0) {
          try {
            await client.from("invoices").upsert(cleanInvoices, { onConflict: "id", ignoreDuplicates: true });
          } catch (e) {}
        }
        return;
      }

      if (key === "invoice_items") {
        const cleanItems = records
          .filter((item: any) => item && item.id && item.invoice_id)
          .map((item: any) => ({
            id: item.id,
            invoice_id: item.invoice_id,
            product_id: item.product_id || null,
            additive_id: item.additive_id || null,
            quantity: Number(item.quantity) || 1,
            unit_price: Number(item.unit_price) || 0,
            discount: Number(item.discount) || 0,
            customizations: item.customizations || [],
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || new Date().toISOString(),
            deleted_at: item.deleted_at || null
          }));
        if (cleanItems.length > 0) {
          try {
            await client.from("invoice_items").upsert(cleanItems, { onConflict: "id", ignoreDuplicates: true });
          } catch (e) {}
        }
        return;
      }

      const sanitizedRecords = records.map((item: any) => {
        if (!item || typeof item !== "object") return item;
        const cleanObj: any = {};
        for (const k of Object.keys(item)) {
          cleanObj[k] = item[k] === undefined ? null : item[k];
        }
        return cleanObj;
      });

      try {
        await client.from(tableName).upsert(sanitizedRecords, { onConflict: "id", ignoreDuplicates: true });
      } catch (e) {}
    } catch (err) {}
  }

  async syncFromSupabase(): Promise<void> {
    if (typeof window === "undefined") return;
    const client = supabase;
    if (!isSupabaseConfigured || !client) return;
    try {
      console.log("Starting background database synchronization with Supabase...");
      const [
        rUsers,
        rCategories,
        rSubTypes,
        rLocations,
        rProducts,
        rStock,
        rAdditives,
        rDamaged,
        rInvoices,
        rInvoiceItems
      ] = await Promise.all([
        client.from("users").select("*"),
        client.from("categories").select("*"),
        client.from("sub_types").select("*"),
        client.from("storage_locations").select("*"),
        client.from("products").select("*"),
        client.from("stock").select("*"),
        client.from("additives").select("*"),
        client.from("damaged_stock").select("*"),
        client.from("invoices").select("*"),
        client.from("invoice_items").select("*")
      ]);

      const syncTable = async (key: string, cloudData: any[] | null, defaultValue: any) => {
        let tableName = key;
        if (key === "locations") tableName = "storage_locations";
        const localData = getStorageItem(key, defaultValue);

        if (key === "invoices") {
          const rawInvoices = cloudData || [];
          const rawItems = rInvoiceItems.data || [];

          const mapItems = new Map<string, InvoiceItem[]>();
          for (const item of rawItems) {
            if (item && item.invoice_id) {
              const list = mapItems.get(item.invoice_id) || [];
              list.push(item);
              mapItems.set(item.invoice_id, list);
            }
          }

          const cleanInvoices = rawInvoices.map((inv: any) => ({
            ...inv,
            items: mapItems.get(inv.id) || []
          }));

          const localInvoices = Array.isArray(localData) ? localData : [];
          const mergedMap = new Map();
          for (const inv of localInvoices) {
            if (inv && inv.id) mergedMap.set(inv.id, inv);
          }
          for (const inv of cleanInvoices) {
            if (inv && inv.id) mergedMap.set(inv.id, inv);
          }
          const finalInvoices = Array.from(mergedMap.values());
          setStorageItem("invoices", finalInvoices);
          setStorageItem("invoice_items", rawItems);
          return;
        }

        if (key === "invoice_items") return;

        if (cloudData && cloudData.length > 0) {
          if (["products", "categories", "sub_types", "locations"].includes(key) && Array.isArray(localData) && localData.length > 0) {
            const map = new Map();
            for (const item of localData) {
              if (item && item.id) map.set(item.id, item);
            }
            for (const item of cloudData) {
              if (item && item.id && !map.has(item.id)) {
                map.set(item.id, item);
              }
            }
            const mergedCatalog = Array.from(map.values());
            setStorageItem(key, mergedCatalog);
            if (mergedCatalog.length > cloudData.length) {
              await this.syncToSupabase(key, mergedCatalog);
            }
          } else if (!Array.isArray(localData) || localData.length === 0 || cloudData.length >= localData.length) {
            setStorageItem(key, cloudData);
          } else if (Array.isArray(localData) && localData.length > cloudData.length) {
            await this.syncToSupabase(key, localData);
          }
        } else if (localData && Array.isArray(localData) && localData.length > 0) {
          await this.syncToSupabase(key, localData);
        }
      };

      await Promise.all([
        syncTable("users", rUsers.data, initialUsers),
        syncTable("categories", rCategories.data, initialCategories),
        syncTable("sub_types", rSubTypes.data, initialSubTypes),
        syncTable("locations", rLocations.data, initialLocations),
        syncTable("products", rProducts.data, initialProducts),
        syncTable("stock", rStock.data, initialStock),
        syncTable("additives", rAdditives.data, initialAdditives),
        syncTable("damaged_stock", rDamaged.data, initialDamagedStock),
        syncTable("invoices", rInvoices.data, initialInvoices),
        syncTable("invoice_items", rInvoiceItems.data, initialInvoiceItems)
      ]);
      console.log("Database synchronization with Supabase completed successfully!");
    } catch (err) {
      console.error("Database sync failed:", err);
    }
  }

  getCurrentSessionUser(): User | null {
    if (typeof window === "undefined") return null;
    try {
      const sessionStr = window.localStorage.getItem("jenny_session_user") || window.sessionStorage.getItem("jenny_session_user");
      return sessionStr ? JSON.parse(sessionStr) : null;
    } catch {
      return null;
    }
  }
  getUsers(): User[] {
    return getStorageItem("users", initialUsers).filter(u => u.deleted_at === null);
  }

  createUser(username: string, passwordHash: string, rights: { view_stock: boolean; generate_bill: boolean; edit_inventory: boolean }, role: "super_admin" | "operator" = "operator"): User {
    const list = getStorageItem<User[]>("users", initialUsers);
    const usernameLower = username.trim().toLowerCase();
    const exists = list.some(u => u.username.toLowerCase() === usernameLower && u.deleted_at === null);
    if (exists) throw new Error(`User "${username.trim()}" already exists.`);

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      username: username.trim().toLowerCase(),
      password_hash: passwordHash,
      role,
      rights,
      created_at: new Date().toISOString(),
      deleted_at: null,
      require_password_change: false,
      current_session_token: null
    };
    list.push(newUser);
    setStorageItem("users", list);
    return newUser;
  }

  deleteUser(id: string, callerUserId: string): boolean {
    if (id === "usr-admin") {
      throw new Error("Cannot delete primary Super Admin account.");
    }
    if (id === callerUserId) {
      throw new Error("Cannot delete your own currently logged-in account.");
    }
    const list = getStorageItem<User[]>("users", initialUsers);
    const updated = list.map(u => u.id === id ? { ...u, deleted_at: new Date().toISOString() } : u);
    setStorageItem("users", updated);
    return true;
  }

  updateUserSessionToken(id: string, token: string | null): User {
    const list = getStorageItem<User[]>("users", initialUsers);
    const idx = list.findIndex(u => u.id === id && u.deleted_at === null);
    if (idx !== -1) {
      list[idx].current_session_token = token;
      list[idx].updated_at = new Date().toISOString();
      setStorageItem("users", list);
      return list[idx];
    }
    throw new Error("User not found.");
  }

  updateUserRights(id: string, rights: { view_stock: boolean; generate_bill: boolean; edit_inventory: boolean }, callerUserId: string): User {
    const caller = this.getUsers().find(u => u.id === callerUserId);
    if (!caller || caller.role !== "super_admin") {
      throw new Error("Unauthorized: Only Super Admins can update user permissions.");
    }
    const list = getStorageItem<User[]>("users", initialUsers);
    const matchedIdx = list.findIndex(u => u.id === id && u.deleted_at === null);
    if (matchedIdx === -1) {
      throw new Error("User not found.");
    }
    if (list[matchedIdx].id === "usr-admin") {
      throw new Error("Cannot modify rights for primary Super Admin.");
    }
    list[matchedIdx].rights = rights;
    list[matchedIdx].updated_at = new Date().toISOString();
    setStorageItem("users", list);
    return list[matchedIdx];
  }

  resetUserPassword(id: string, defaultPasswordHash: string, callerUserId: string): User {
    const caller = this.getUsers().find(u => u.id === callerUserId);
    if (!caller || caller.role !== "super_admin") {
      throw new Error("Unauthorized: Only Super Admins can reset user passwords.");
    }
    const list = getStorageItem<User[]>("users", initialUsers);
    const matchedIdx = list.findIndex(u => u.id === id && u.deleted_at === null);
    if (matchedIdx === -1) throw new Error("User not found.");
    if (list[matchedIdx].id === "usr-admin") {
      throw new Error("Cannot reset the primary Super Admin account's password.");
    }
    list[matchedIdx].password_hash = defaultPasswordHash;
    list[matchedIdx].require_password_change = true;
    list[matchedIdx].updated_at = new Date().toISOString();
    setStorageItem("users", list);
    return list[matchedIdx];
  }

  changeUserPassword(id: string, newPasswordHash: string): User {
    const list = getStorageItem<User[]>("users", initialUsers);
    const matchedIdx = list.findIndex(u => u.id === id && u.deleted_at === null);
    if (matchedIdx === -1) throw new Error("User not found.");
    list[matchedIdx].password_hash = newPasswordHash;
    list[matchedIdx].require_password_change = false;
    list[matchedIdx].updated_at = new Date().toISOString();
    setStorageItem("users", list);
    return list[matchedIdx];
  }

  getActiveDevices(): any[] {
    if (typeof window === "undefined") return [];
    const item = window.localStorage.getItem("jenny_creation_active_devices");
    return item ? JSON.parse(item) : [];
  }

  getStockMovements(): StockMovement[] {
    return getStorageItem<StockMovement[]>("stock_movements", []);
  }

  logStockMovement(
    itemName: string,
    itemType: "product" | "dryfruit",
    quantity: number,
    movementType: "added" | "removed" | "transferred" | "damaged",
    fromLocationName?: string,
    toLocationName?: string,
    operatorName?: string
  ): void {
    const list = getStorageItem<StockMovement[]>("stock_movements", []);
    const newMovement: StockMovement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      item_name: itemName,
      item_type: itemType,
      quantity,
      movement_type: movementType,
      from_location_name: fromLocationName,
      to_location_name: toLocationName,
      operator_name: operatorName || "System",
      timestamp: new Date().toISOString()
    };
    list.unshift(newMovement);
    setStorageItem("stock_movements", list);
  }

  getCategories(): Category[] {
    return getStorageItem("categories", initialCategories).filter(c => !c.deleted_at);
  }
  
  getSubTypes(): SubType[] {
    return getStorageItem("sub_types", initialSubTypes).filter(s => !s.deleted_at);
  }
  
  getLocations(): StorageLocation[] {
    return getStorageItem("locations", initialLocations).filter(l => !l.deleted_at);
  }
  
  getProducts(): Product[] {
    const productsList = getStorageItem<Product[]>("products", initialProducts);
    
    const seenIds = new Set<string>();
    let hasDuplicates = false;
    
    for (const p of productsList) {
      if (seenIds.has(p.id)) {
        hasDuplicates = true;
        break;
      }
      seenIds.add(p.id);
    }
    
    if (hasDuplicates) {
      console.warn("Detected duplicate product IDs in localStorage. Sanitizing product tables...");
      const idMap = new Map<string, string>();
      const cleanedProducts: Product[] = [];
      const usedIds = new Set<string>();
      
      for (const p of productsList) {
        if (usedIds.has(p.id)) {
          const newId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          idMap.set(p.id, newId);
          cleanedProducts.push({ ...p, id: newId });
          usedIds.add(newId);
        } else {
          cleanedProducts.push(p);
          usedIds.add(p.id);
        }
      }
      
      setStorageItem("products", cleanedProducts);
      
      // Clean corresponding stock tables
      const stockList = getStorageItem<Stock[]>("stock", initialStock);
      let stockUpdated = false;
      const cleanedStock = stockList.map(st => {
        if (st.product_id && idMap.has(st.product_id)) {
          stockUpdated = true;
          return { ...st, product_id: idMap.get(st.product_id)! };
        }
        return st;
      });
      if (stockUpdated) {
        setStorageItem("stock", cleanedStock);
      }
      
      // Clean corresponding invoice items
      const invoiceItemsList = getStorageItem<InvoiceItem[]>("invoice_items", initialInvoiceItems);
      let invoiceItemsUpdated = false;
      const cleanedInvoiceItems = invoiceItemsList.map(item => {
        if (item.product_id && idMap.has(item.product_id)) {
          invoiceItemsUpdated = true;
          return { ...item, product_id: idMap.get(item.product_id)! };
        }
        return item;
      });
      if (invoiceItemsUpdated) {
        setStorageItem("invoice_items", cleanedInvoiceItems);
      }
      
      return cleanedProducts.filter(p => !p.deleted_at);
    }
    
    return productsList.filter(p => !p.deleted_at);
  }

  getStock(): Stock[] {
    return getStorageItem("stock", initialStock).filter(st => !st.deleted_at);
  }

  getInvoices(): Invoice[] {
    const invoices = getStorageItem("invoices", initialInvoices).filter(i => !i.deleted_at);
    const invoiceItems = getStorageItem("invoice_items", initialInvoiceItems).filter(item => !item.deleted_at);
    
    return invoices.map(inv => ({
      ...inv,
      items: invoiceItems.filter(item => item.invoice_id === inv.id)
    }));
  }

  // Soft Delete generic
  softDelete(table: string, id: string, callerUser?: any): boolean {
    const user = callerUser || this.getCurrentSessionUser();
    if (user && user.role !== 'super_admin') {
      if (table === 'invoices' && !user.rights.generate_bill && !user.rights.edit_inventory) {
        throw new Error('Unauthorized: Your user account lacks permission to delete invoices.');
      }
      if (table !== 'invoices' && !user.rights.edit_inventory) {
        throw new Error('Unauthorized: Your user account lacks permission to modify inventory.');
      }
    }

    const now = new Date().toISOString();
    let found = false;
    if (table === "products") {
      const list = getStorageItem<Product[]>("products", initialProducts);
      const idx = list.findIndex(item => item.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], deleted_at: now, updated_at: now };
        setStorageItem("products", list);
        found = true;
      }
    } else if (table === "stock") {
      const list = getStorageItem<Stock[]>("stock", initialStock);
      const idx = list.findIndex(item => item.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], deleted_at: now, updated_at: now };
        setStorageItem("stock", list);
        found = true;
      }
    } else if (table === "invoices") {
      const list = getStorageItem<Invoice[]>("invoices", initialInvoices);
      const idx = list.findIndex(item => item.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], deleted_at: now, updated_at: now };
        setStorageItem("invoices", list);
        found = true;
      }
    } else if (table === "categories") {
      const list = getStorageItem<Category[]>("categories", initialCategories);
      const idx = list.findIndex(item => item.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], deleted_at: now, updated_at: now };
        setStorageItem("categories", list);
        found = true;
      }
    } else if (table === "sub_types") {
      const list = getStorageItem<SubType[]>("sub_types", initialSubTypes);
      const idx = list.findIndex(item => item.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], deleted_at: now, updated_at: now };
        setStorageItem("sub_types", list);
        found = true;
      }
    } else if (table === "locations") {
      const list = getStorageItem<StorageLocation[]>("locations", initialLocations);
      const idx = list.findIndex(item => item.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], deleted_at: now, updated_at: now };
        setStorageItem("locations", list);
        found = true;
      }
    } else if (table === "additives") {
      const list = getStorageItem<Additive[]>("additives", initialAdditives);
      const idx = list.findIndex(item => item.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], deleted_at: now, updated_at: now };
        setStorageItem("additives", list);
        found = true;
      }
    } else if (table === "damaged_stock") {
      const list = getStorageItem<DamagedStock[]>("damaged_stock", initialDamagedStock);
      const idx = list.findIndex(item => item.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], deleted_at: now, updated_at: now };
        setStorageItem("damaged_stock", list);
        found = true;
      }
    }

    if (found && isSupabaseConfigured) {
      this.syncToSupabase(table, getStorageItem(table, [])).catch(err => console.warn("Supabase sync notice on soft delete:", err));
    }
    return found;
  }

  restore(table: string, id: string, callerUser?: any): boolean {
    const user = callerUser || this.getCurrentSessionUser();
    if (user && user.role !== 'super_admin') {
      if (table === 'invoices' && !user.rights.generate_bill && !user.rights.edit_inventory) {
        throw new Error('Unauthorized: Your user account lacks permission to restore invoices.');
      }
      if (table !== 'invoices' && !user.rights.edit_inventory) {
        throw new Error('Unauthorized: Your user account lacks permission to modify inventory.');
      }
    }

    let found = false;
    if (table === "products") {
      const list = getStorageItem<Product[]>("products", initialProducts);
      const idx = list.findIndex(item => item.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], deleted_at: null };
        setStorageItem("products", list);
        found = true;
      }
    } else if (table === "stock") {
      const list = getStorageItem<Stock[]>("stock", initialStock);
      const idx = list.findIndex(item => item.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], deleted_at: null };
        setStorageItem("stock", list);
        found = true;
      }
    } else if (table === "invoices") {
      const list = getStorageItem<Invoice[]>("invoices", initialInvoices);
      const idx = list.findIndex(item => item.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], deleted_at: null };
        setStorageItem("invoices", list);
        found = true;
      }
    } else if (table === "categories") {
      const list = getStorageItem<Category[]>("categories", initialCategories);
      const idx = list.findIndex(item => item.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], deleted_at: null };
        setStorageItem("categories", list);
        found = true;
      }
    } else if (table === "sub_types") {
      const list = getStorageItem<SubType[]>("sub_types", initialSubTypes);
      const idx = list.findIndex(item => item.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], deleted_at: null };
        setStorageItem("sub_types", list);
        found = true;
      }
    } else if (table === "locations") {
      const list = getStorageItem<StorageLocation[]>("locations", initialLocations);
      const idx = list.findIndex(item => item.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], deleted_at: null };
        setStorageItem("locations", list);
        found = true;
      }
    } else if (table === "additives") {
      const list = getStorageItem<Additive[]>("additives", initialAdditives);
      const idx = list.findIndex(item => item.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], deleted_at: null };
        setStorageItem("additives", list);
        found = true;
      }
    } else if (table === "damaged_stock") {
      const list = getStorageItem<DamagedStock[]>("damaged_stock", initialDamagedStock);
      const idx = list.findIndex(item => item.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], deleted_at: null };
        setStorageItem("damaged_stock", list);
        found = true;
      }
    }

    if (found && isSupabaseConfigured) {
      this.syncToSupabase(table, getStorageItem(table, [])).catch(err => console.warn("Supabase sync notice on restore:", err));
    }
    return found;
  }

  getDeletedCategories(): Category[] {
    return getStorageItem("categories", initialCategories).filter(c => c.deleted_at !== null);
  }

  getDeletedSubTypes(): SubType[] {
    return getStorageItem("sub_types", initialSubTypes).filter(s => s.deleted_at !== null);
  }

  getDeletedLocations(): StorageLocation[] {
    return getStorageItem("locations", initialLocations).filter(l => l.deleted_at !== null);
  }

  getDeletedProducts(): Product[] {
    return getStorageItem("products", initialProducts).filter(p => p.deleted_at !== null);
  }

  getDeletedInvoices(): Invoice[] {
    return getStorageItem("invoices", initialInvoices).filter(i => i.deleted_at !== null);
  }

  updateCategory(id: string, name: string, callerUser?: any): Category | null {
    const user = callerUser || this.getCurrentSessionUser();
    if (user && user.role !== 'super_admin' && !user.rights.edit_inventory) {
      throw new Error('Unauthorized: Your user account lacks permission to modify inventory.');
    }
    const list = getStorageItem<Category[]>("categories", initialCategories);
    
    const nameLower = name.trim().toLowerCase();
    const exists = list.some(c => c.id !== id && c.name.toLowerCase() === nameLower && c.deleted_at === null);
    if (exists) throw new Error(`Category "${name.trim()}" already exists.`);

    const idx = list.findIndex(c => c.id === id);
    if (idx >= 0) {
      list[idx].name = name.trim();
      list[idx].updated_at = new Date().toISOString();
      setStorageItem("categories", list);
      return list[idx];
    }
    return null;
  }

  updateSubType(id: string, name: string, categoryId: string, callerUser?: any): SubType | null {
    const user = callerUser || this.getCurrentSessionUser();
    if (user && user.role !== 'super_admin' && !user.rights.edit_inventory) {
      throw new Error('Unauthorized: Your user account lacks permission to modify inventory.');
    }
    if (categoryId) {
      const categories = getStorageItem<Category[]>("categories", initialCategories);
      const catExists = categories.some(c => c.id === categoryId && c.deleted_at === null);
      if (!catExists) {
        throw new Error(`Foreign Key Error: Category with id "${categoryId}" does not exist or is deleted.`);
      }
    }
    const list = getStorageItem<SubType[]>("sub_types", initialSubTypes);
    
    const nameLower = name.trim().toLowerCase();
    const exists = list.some(s => s.id !== id && s.category_id === categoryId && s.name.toLowerCase() === nameLower && s.deleted_at === null);
    if (exists) throw new Error(`Sub-Type "${name.trim()}" already exists under this category.`);

    const idx = list.findIndex(s => s.id === id);
    if (idx >= 0) {
      list[idx].name = name.trim();
      list[idx].category_id = categoryId;
      list[idx].updated_at = new Date().toISOString();
      setStorageItem("sub_types", list);
      return list[idx];
    }
    return null;
  }

  updateLocation(id: string, name: string, callerUser?: any): StorageLocation | null {
    const user = callerUser || this.getCurrentSessionUser();
    if (user && user.role !== 'super_admin' && !user.rights.edit_inventory) {
      throw new Error('Unauthorized: Your user account lacks permission to modify inventory.');
    }
    const list = getStorageItem<StorageLocation[]>("locations", initialLocations);
    
    const nameLower = name.trim().toLowerCase();
    const exists = list.some(l => l.id !== id && l.name.toLowerCase() === nameLower && l.deleted_at === null);
    if (exists) throw new Error(`Storage location "${name.trim()}" already exists.`);

    const idx = list.findIndex(l => l.id === id);
    if (idx >= 0) {
      list[idx].name = name.trim();
      list[idx].updated_at = new Date().toISOString();
      setStorageItem("locations", list);
      return list[idx];
    }
    return null;
  }

  // Insert product
  addProduct(name: string, categoryId: string, subTypeId: string, photos: string[], price: number, supplierCode?: string, callerUser?: any): Product {
    const user = callerUser || this.getCurrentSessionUser();
    if (user && user.role !== 'super_admin' && !user.rights.edit_inventory) {
      throw new Error('Unauthorized: Your user account lacks permission to modify inventory.');
    }
    if (categoryId) {
      const categories = getStorageItem<Category[]>("categories", initialCategories);
      const catExists = categories.some(c => c.id === categoryId && c.deleted_at === null);
      if (!catExists) {
        throw new Error(`Foreign Key Error: Category with id "${categoryId}" does not exist or is deleted.`);
      }
    }
    if (subTypeId) {
      const subTypes = getStorageItem<SubType[]>("sub_types", initialSubTypes);
      const subExists = subTypes.some(s => s.id === subTypeId && s.deleted_at === null);
      if (!subExists) {
        throw new Error(`Foreign Key Error: SubType with id "${subTypeId}" does not exist or is deleted.`);
      }
    }
    const list = getStorageItem<Product[]>("products", initialProducts);
    const newProduct: Product = {
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      category_id: categoryId,
      sub_type_id: subTypeId,
      photos: photos.length > 0 ? photos : ["https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60"],
      price,
      supplier_code: supplierCode || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
    list.push(newProduct);
    setStorageItem("products", list);
    return newProduct;
  }

  updateProduct(id: string, name: string, categoryId: string, subTypeId: string, photos: string[], price: number, supplierCode?: string, callerUser?: any): Product | null {
    const user = callerUser || this.getCurrentSessionUser();
    if (user && user.role !== 'super_admin' && !user.rights.edit_inventory) {
      throw new Error('Unauthorized: Your user account lacks permission to modify inventory.');
    }
    if (categoryId) {
      const categories = getStorageItem<Category[]>("categories", initialCategories);
      const catExists = categories.some(c => c.id === categoryId && c.deleted_at === null);
      if (!catExists) {
        throw new Error(`Foreign Key Error: Category with id "${categoryId}" does not exist or is deleted.`);
      }
    }
    if (subTypeId) {
      const subTypes = getStorageItem<SubType[]>("sub_types", initialSubTypes);
      const subExists = subTypes.some(s => s.id === subTypeId && s.deleted_at === null);
      if (!subExists) {
        throw new Error(`Foreign Key Error: SubType with id "${subTypeId}" does not exist or is deleted.`);
      }
    }
    const list = getStorageItem<Product[]>("products", initialProducts);
    const idx = list.findIndex(p => p.id === id);
    if (idx >= 0) {
      list[idx].name = name;
      list[idx].category_id = categoryId;
      list[idx].sub_type_id = subTypeId;
      list[idx].photos = photos.length > 0 ? photos : ["https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60"];
      list[idx].price = price;
      list[idx].supplier_code = supplierCode || undefined;
      list[idx].updated_at = new Date().toISOString();
      setStorageItem("products", list);
      return list[idx];
    }
    return null;
  }

  // Insert category
  addCategory(name: string, callerUser?: any): Category {
    const user = callerUser || this.getCurrentSessionUser();
    if (user && user.role !== 'super_admin' && !user.rights.edit_inventory) {
      throw new Error('Unauthorized: Your user account lacks permission to modify inventory.');
    }
    const list = getStorageItem<Category[]>("categories", initialCategories);
    
    const nameLower = name.trim().toLowerCase();
    const exists = list.some(c => c.name.toLowerCase() === nameLower && c.deleted_at === null);
    if (exists) throw new Error(`Category "${name.trim()}" already exists.`);

    const newItem: Category = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
    list.push(newItem);
    setStorageItem("categories", list);
    return newItem;
  }

  // Insert sub-type
  addSubType(name: string, categoryId: string, callerUser?: any): SubType {
    const user = callerUser || this.getCurrentSessionUser();
    if (user && user.role !== 'super_admin' && !user.rights.edit_inventory) {
      throw new Error('Unauthorized: Your user account lacks permission to modify inventory.');
    }
    if (categoryId) {
      const categories = getStorageItem<Category[]>("categories", initialCategories);
      const catExists = categories.some(c => c.id === categoryId && c.deleted_at === null);
      if (!catExists) {
        throw new Error(`Foreign Key Error: Category with id "${categoryId}" does not exist or is deleted.`);
      }
    }
    const list = getStorageItem<SubType[]>("sub_types", initialSubTypes);
    
    const nameLower = name.trim().toLowerCase();
    const exists = list.some(s => s.category_id === categoryId && s.name.toLowerCase() === nameLower && s.deleted_at === null);
    if (exists) throw new Error(`Sub-Type "${name.trim()}" already exists under this category.`);

    const newItem: SubType = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      category_id: categoryId,
      name: name.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
    list.push(newItem);
    setStorageItem("sub_types", list);
    return newItem;
  }

  // Insert location
  addLocation(name: string, callerUser?: any): StorageLocation {
    const user = callerUser || this.getCurrentSessionUser();
    if (user && user.role !== 'super_admin' && !user.rights.edit_inventory) {
      throw new Error('Unauthorized: Your user account lacks permission to modify inventory.');
    }
    const list = getStorageItem<StorageLocation[]>("locations", initialLocations);
    
    const nameLower = name.trim().toLowerCase();
    const exists = list.some(l => l.name.toLowerCase() === nameLower && l.deleted_at === null);
    if (exists) throw new Error(`Storage location "${name.trim()}" already exists.`);

    const newItem: StorageLocation = {
      id: `loc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
    list.push(newItem);
    setStorageItem("locations", list);
    return newItem;
  }

  // Set or update stock quantity
  updateStock(productId: string | null, locationId: string, quantity: number, additiveId: string | null = null, callerUser?: any): Stock {
    const user = callerUser || this.getCurrentSessionUser();
    if (user && user.role !== 'super_admin' && !user.rights.edit_inventory) {
      throw new Error('Unauthorized: Your user account lacks permission to modify inventory.');
    }
    if (quantity < 0 || isNaN(quantity)) {
      throw new Error('Invalid stock quantity. Quantity cannot be negative.');
    }
    const list = getStorageItem<Stock[]>("stock", initialStock);
    const existingIndex = list.findIndex(
      st => st.product_id === productId && 
            st.additive_id === additiveId && 
            st.storage_location_id === locationId && 
            st.deleted_at === null
    );
    
    const oldQty = existingIndex >= 0 ? list[existingIndex].quantity : 0;
    const diff = quantity - oldQty;
    
    let resultStock: Stock;
    if (existingIndex >= 0) {
      list[existingIndex].quantity = quantity;
      list[existingIndex].updated_at = new Date().toISOString();
      setStorageItem("stock", list);
      resultStock = list[existingIndex];
    } else {
      const newStock: Stock = {
        id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        product_id: productId,
        additive_id: additiveId,
        storage_location_id: locationId,
        quantity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      };
      list.push(newStock);
      setStorageItem("stock", list);
      resultStock = newStock;
    }

    if (diff !== 0) {
      const itemName = productId 
        ? (getStorageItem<Product[]>("products", initialProducts).find(p => p.id === productId)?.name || "Product")
        : (getStorageItem<Additive[]>("additives", initialAdditives).find(a => a.id === additiveId)?.name || "Dryfruit");
      
      const locName = getStorageItem<StorageLocation[]>("locations", initialLocations).find(l => l.id === locationId)?.name || "Storage";
      
      this.logStockMovement(
        itemName,
        productId ? "product" : "dryfruit",
        Math.abs(diff),
        diff > 0 ? "added" : "removed",
        diff > 0 ? undefined : locName,
        diff > 0 ? locName : undefined,
        user?.username || "System"
      );
    }

    return resultStock;
  }

  // Move stock between locations
  moveStock(productId: string | null, sourceLocationId: string, destinationLocationId: string, quantity: number, additiveId: string | null = null, callerUser?: any): boolean {
    const user = callerUser || this.getCurrentSessionUser();
    if (user && user.role !== 'super_admin' && !user.rights.edit_inventory) {
      throw new Error('Unauthorized: Your user account lacks permission to modify inventory.');
    }
    if (sourceLocationId === destinationLocationId) {
      throw new Error("Source and destination locations cannot be the same.");
    }
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than zero.");
    }

    const list = getStorageItem<Stock[]>("stock", initialStock);
    
    const sourceIndex = list.findIndex(
      st => st.product_id === productId && 
            st.additive_id === additiveId &&
            st.storage_location_id === sourceLocationId && 
            st.deleted_at === null
    );

    if (sourceIndex === -1 || list[sourceIndex].quantity < quantity) {
      throw new Error("Insufficient stock available at the source location.");
    }

    list[sourceIndex].quantity -= quantity;
    list[sourceIndex].updated_at = new Date().toISOString();

    const destIndex = list.findIndex(
      st => st.product_id === productId && 
            st.additive_id === additiveId &&
            st.storage_location_id === destinationLocationId && 
            st.deleted_at === null
    );

    if (destIndex >= 0) {
      list[destIndex].quantity += quantity;
      list[destIndex].updated_at = new Date().toISOString();
    } else {
      list.push({
        id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        product_id: productId,
        additive_id: additiveId,
        storage_location_id: destinationLocationId,
        quantity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      });
    }

    setStorageItem("stock", list);

    const itemName = productId 
      ? (getStorageItem<Product[]>("products", initialProducts).find(p => p.id === productId)?.name || "Product")
      : (getStorageItem<Additive[]>("additives", initialAdditives).find(a => a.id === additiveId)?.name || "Dryfruit");

    const srcLocName = getStorageItem<StorageLocation[]>("locations", initialLocations).find(l => l.id === sourceLocationId)?.name || "Source Loc";
    const destLocName = getStorageItem<StorageLocation[]>("locations", initialLocations).find(l => l.id === destinationLocationId)?.name || "Dest Loc";

    this.logStockMovement(
      itemName,
      productId ? "product" : "dryfruit",
      quantity,
      "transferred",
      srcLocName,
      destLocName,
      user?.username || "System"
    );

    return true;
  }

  // Create Invoice
  createInvoice(customerName: string, customerPhone: string, items: { productId: string | null; additiveId?: string | null; quantity: number; unitPrice: number; discount: number; customizations?: JarCustomization[] }[], status: "ordered" | "preparing" | "completed" | "delivered" = "ordered", deliveryDate?: string, advancePaid?: number, paymentMode?: string, deviceInfo?: any, creatorUser?: any): Invoice {
    const invoices = getStorageItem<Invoice[]>("invoices", initialInvoices);
    const invoiceItems = getStorageItem<InvoiceItem[]>("invoice_items", initialInvoiceItems);

    const user = creatorUser || this.getCurrentSessionUser();
    if (user && user.role !== "super_admin" && !user.rights.generate_bill) {
      throw new Error("Unauthorized: Your user account lacks permission to generate bills.");
    }
    
    const invoiceId = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const invoiceNumber = `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`;
    
    const stocks = getStorageItem<Stock[]>("stock", initialStock);
    const products = getStorageItem<Product[]>("products", initialProducts);
    const additives = getStorageItem<Additive[]>("additives", initialAdditives);
 
    const isPreOrder = deliveryDate && deliveryDate.trim() !== "";

    // 1. Pre-validation checks for products and dryfruits shortages (aggregate across all line items)
    const reqProductQty: { [id: string]: number } = {};
    const reqAdditiveQty: { [id: string]: number } = {};

    for (const item of items) {
      if (item.productId) {
        reqProductQty[item.productId] = (reqProductQty[item.productId] || 0) + item.quantity;
        item.customizations?.forEach(jar => {
          if (jar.additive_id !== "empty" && jar.weight_grams > 0) {
            reqAdditiveQty[jar.additive_id] = (reqAdditiveQty[jar.additive_id] || 0) + (jar.weight_grams * item.quantity) / 1000;
          }
        });
      } else if (item.additiveId) {
        reqAdditiveQty[item.additiveId] = (reqAdditiveQty[item.additiveId] || 0) + item.quantity;
      }
    }

    if (!isPreOrder) {
      for (const [prodId, totalQtyNeeded] of Object.entries(reqProductQty)) {
        const activeProductStocks = stocks.filter(st => st.product_id === prodId && st.deleted_at === null);
        const totalAvailable = activeProductStocks.reduce((sum, s) => sum + s.quantity, 0);
        if (totalAvailable < totalQtyNeeded) {
          const prod = products.find(p => p.id === prodId);
          const productName = prod ? prod.name : "Product";
          throw new Error(`Insufficient stock for "${productName}". Requested: ${totalQtyNeeded}, Available: ${totalAvailable}`);
        }
      }

      for (const [addId, weightNeeded] of Object.entries(reqAdditiveQty)) {
        const activeAddStocks = stocks.filter(st => st.additive_id === addId && st.deleted_at === null);
        const totalAddAvail = activeAddStocks.reduce((sum, s) => sum + s.quantity, 0);
        if (totalAddAvail < weightNeeded) {
          const addObj = additives.find(a => a.id === addId);
          throw new Error(`Insufficient stock of dryfruit ingredient "${addObj ? addObj.name : "Additive"}". Required: ${weightNeeded.toFixed(2)} kg, Available: ${totalAddAvail.toFixed(2)} kg`);
        }
      }
    }
 
    let totalAmount = 0;
    const newItems: InvoiceItem[] = items.map((item, idx) => {
      const discountVal = item.discount || 0;
      const totalPrice = item.quantity * item.unitPrice * (1 - discountVal / 100);
      totalAmount += totalPrice;
      
      if (item.productId) {
        let remainingToDeduct = item.quantity;
        const activeProductStocks = stocks.filter(st => st.product_id === item.productId && st.deleted_at === null);
        
        for (const st of activeProductStocks) {
          if (remainingToDeduct <= 0) break;
          const qtyDeducted = Math.min(st.quantity, remainingToDeduct);
          st.quantity -= qtyDeducted;
          st.updated_at = new Date().toISOString();
          remainingToDeduct -= qtyDeducted;

          item.customizations?.forEach(jar => {
            if (jar.additive_id !== "empty" && jar.weight_grams > 0) {
              const weightToDeduct = (jar.weight_grams * qtyDeducted) / 1000;
              let addSt = stocks.find(s => s.additive_id === jar.additive_id && s.storage_location_id === st.storage_location_id && s.deleted_at === null);
              if (!addSt) {
                addSt = {
                  id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                  product_id: null,
                  additive_id: jar.additive_id,
                  storage_location_id: st.storage_location_id,
                  quantity: 0,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  deleted_at: null
                };
                stocks.push(addSt);
              }
              addSt.quantity -= weightToDeduct;
              addSt.updated_at = new Date().toISOString();
            }
          });
        }
        
        if (remainingToDeduct > 0 && isPreOrder) {
          const locations = getStorageItem<StorageLocation[]>("locations", initialLocations);
          const firstLoc = locations.find(l => l.deleted_at === null) || locations[0];
          
          if (firstLoc) {
            let activeBoxSt = activeProductStocks.find(s => s.storage_location_id === firstLoc.id);
            if (!activeBoxSt) {
              activeBoxSt = {
                id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                product_id: item.productId,
                additive_id: null,
                storage_location_id: firstLoc.id,
                quantity: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null
              };
              stocks.push(activeBoxSt);
            }
            activeBoxSt.quantity -= remainingToDeduct;
            activeBoxSt.updated_at = new Date().toISOString();

            item.customizations?.forEach(jar => {
              if (jar.additive_id !== "empty" && jar.weight_grams > 0) {
                const weightToDeduct = (jar.weight_grams * remainingToDeduct) / 1000;
                let addSt = stocks.find(s => s.additive_id === jar.additive_id && s.storage_location_id === firstLoc.id && s.deleted_at === null);
                if (!addSt) {
                  addSt = {
                    id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                    product_id: null,
                    additive_id: jar.additive_id,
                    storage_location_id: firstLoc.id,
                    quantity: 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    deleted_at: null
                  };
                  stocks.push(addSt);
                }
                addSt.quantity -= weightToDeduct;
                addSt.updated_at = new Date().toISOString();
              }
            });
          }
        }
      } else if (item.additiveId) {
        let remainingToDeduct = item.quantity;
        const activeAddStocks = stocks.filter(st => st.additive_id === item.additiveId && st.deleted_at === null);
        
        for (const st of activeAddStocks) {
          if (remainingToDeduct <= 0) break;
          const qtyDeducted = Math.min(st.quantity, remainingToDeduct);
          st.quantity -= qtyDeducted;
          st.updated_at = new Date().toISOString();
          remainingToDeduct -= qtyDeducted;
        }

        if (remainingToDeduct > 0 && isPreOrder) {
          const locations = getStorageItem<StorageLocation[]>("locations", initialLocations);
          const firstLoc = locations.find(l => l.deleted_at === null) || locations[0];
          if (firstLoc) {
            let activeAddSt = activeAddStocks.find(s => s.storage_location_id === firstLoc.id);
            if (!activeAddSt) {
              activeAddSt = {
                id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                product_id: null,
                additive_id: item.additiveId,
                storage_location_id: firstLoc.id,
                quantity: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null
              };
              stocks.push(activeAddSt);
            }
            activeAddSt.quantity -= remainingToDeduct;
            activeAddSt.updated_at = new Date().toISOString();
          }
        }
      }
 
      return {
        id: `ivi-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
        invoice_id: invoiceId,
        product_id: item.productId,
        additive_id: item.additiveId || null,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount: discountVal,
        total_price: totalPrice,
        customizations: item.customizations,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      };
    });
 
    const orderId = `ORD-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newInvoice: Invoice = {
      id: invoiceId,
      invoice_number: invoiceNumber,
      customer_name: customerName,
      customer_phone: customerPhone || undefined,
      total_amount: totalAmount,
      status,
      order_id: orderId,
      delivery_date: deliveryDate || undefined,
      advance_paid: advancePaid !== undefined ? Number(advancePaid) : undefined,
      payment_mode: paymentMode || "Cash",
      issue_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      device_info: deviceInfo || null,
      created_by_user_id: user?.id || undefined,
      created_by_username: user?.username || undefined
    };
 
    invoices.push(newInvoice);
    invoiceItems.push(...newItems);
 
    setStorageItem("invoices", invoices);
    setStorageItem("invoice_items", invoiceItems);
    setStorageItem("stock", stocks);
 
    return {
      ...newInvoice,
      items: newItems
    };
  }

  updateInvoiceStatus(id: string, status: "ordered" | "preparing" | "completed" | "delivered"): Invoice | null {
    const list = getStorageItem<Invoice[]>("invoices", initialInvoices);
    const idx = list.findIndex(i => i.id === id);
    if (idx >= 0) {
      list[idx].status = status;
      list[idx].updated_at = new Date().toISOString();
      setStorageItem("invoices", list);
      return list[idx];
    }
    return null;
  }

  updateInvoice(id: string, customerName: string, customerPhone: string, items: { productId: string | null; additiveId?: string | null; quantity: number; unitPrice: number; discount: number; customizations?: JarCustomization[] }[], status: "ordered" | "preparing" | "completed" | "delivered", deliveryDate?: string, advancePaid?: number, paymentMode?: string, deviceInfo?: any, creatorUser?: any): Invoice | null {
    const invoices = getStorageItem<Invoice[]>("invoices", initialInvoices);
    const invoiceItems = getStorageItem<InvoiceItem[]>("invoice_items", initialInvoiceItems);
    const stocks = getStorageItem<Stock[]>("stock", initialStock);
    const products = getStorageItem<Product[]>("products", initialProducts);
    const additives = getStorageItem<Additive[]>("additives", initialAdditives);
    
    const idx = invoices.findIndex(i => i.id === id);
    if (idx < 0) return null;

    const user = creatorUser || this.getCurrentSessionUser();
    if (user && user.role !== "super_admin" && !user.rights.generate_bill) {
      throw new Error("Unauthorized: Your user account lacks permission to update bills.");
    }
    
    // 1. Restore old items stock levels (both products and loose dryfruits, including customized jar fillings!)
    const oldItems = invoiceItems.filter(ivi => ivi.invoice_id === id && ivi.deleted_at === null);
    for (const oldItem of oldItems) {
      if (oldItem.product_id) {
        // Restore box stock
        const st = stocks.find(s => s.product_id === oldItem.product_id && s.deleted_at === null);
        if (st) {
          st.quantity += oldItem.quantity;
          st.updated_at = new Date().toISOString();
          
          // Restore customized jar additives inside that box from the same stock record
          oldItem.customizations?.forEach(jar => {
            if (jar.additive_id !== "empty" && jar.weight_grams > 0) {
              const weightToRestore = (jar.weight_grams * oldItem.quantity) / 1000;
              const addSt = stocks.find(s => s.additive_id === jar.additive_id && s.storage_location_id === st.storage_location_id && s.deleted_at === null);
              if (addSt) {
                addSt.quantity += weightToRestore;
                addSt.updated_at = new Date().toISOString();
              }
            }
          });
        }
      } else if (oldItem.additive_id) {
        // Restore loose dryfruits stock
        // Direct loose dryfruits items might specify storage_location_id or we find the first record
        const addSt = stocks.find(s => s.additive_id === oldItem.additive_id && s.deleted_at === null);
        if (addSt) {
          addSt.quantity += oldItem.quantity;
          addSt.updated_at = new Date().toISOString();
        }
      }
    }
    
    const isPreOrder = deliveryDate && deliveryDate.trim() !== "";

    // 2. Validate aggregate stock availability for all new items
    const reqProductQty: { [id: string]: number } = {};
    const reqAdditiveQty: { [id: string]: number } = {};

    for (const item of items) {
      if (item.productId) {
        reqProductQty[item.productId] = (reqProductQty[item.productId] || 0) + item.quantity;
        item.customizations?.forEach(jar => {
          if (jar.additive_id !== "empty" && jar.weight_grams > 0) {
            reqAdditiveQty[jar.additive_id] = (reqAdditiveQty[jar.additive_id] || 0) + (jar.weight_grams * item.quantity) / 1000;
          }
        });
      } else if (item.additiveId) {
        reqAdditiveQty[item.additiveId] = (reqAdditiveQty[item.additiveId] || 0) + item.quantity;
      }
    }

    if (!isPreOrder) {
      for (const [prodId, totalQtyNeeded] of Object.entries(reqProductQty)) {
        const activeProductStocks = stocks.filter(st => st.product_id === prodId && st.deleted_at === null);
        const totalAvailable = activeProductStocks.reduce((sum, s) => sum + s.quantity, 0);
        if (totalAvailable < totalQtyNeeded) {
          const prod = products.find(p => p.id === prodId);
          const productName = prod ? prod.name : "Product";
          throw new Error(`Insufficient stock for "${productName}". Requested: ${totalQtyNeeded}, Available: ${totalAvailable} (Note: Stock levels reverted)`);
        }
      }

      for (const [addId, weightNeeded] of Object.entries(reqAdditiveQty)) {
        const activeAddStocks = stocks.filter(st => st.additive_id === addId && st.deleted_at === null);
        const totalAddAvail = activeAddStocks.reduce((sum, s) => sum + s.quantity, 0);
        if (totalAddAvail < weightNeeded) {
          const addObj = additives.find(a => a.id === addId);
          throw new Error(`Insufficient stock of dryfruit ingredient "${addObj ? addObj.name : "Additive"}". Required: ${weightNeeded.toFixed(2)} kg, Available: ${totalAddAvail.toFixed(2)} kg (Note: Stock levels reverted)`);
        }
      }
    }
    
    // 3. Deduct stock and save new invoice items
    let totalAmount = 0;
    const updatedItems: InvoiceItem[] = items.map((item, indexVal) => {
      const discountVal = item.discount || 0;
      const totalPrice = item.quantity * item.unitPrice * (1 - discountVal / 100);
      totalAmount += totalPrice;
      
      if (item.productId) {
        let remainingToDeduct = item.quantity;
        const activeProductStocks = stocks.filter(st => st.product_id === item.productId && st.deleted_at === null);
        
        for (const st of activeProductStocks) {
          if (remainingToDeduct <= 0) break;
          const qtyDeducted = Math.min(st.quantity, remainingToDeduct);
          st.quantity -= qtyDeducted;
          st.updated_at = new Date().toISOString();
          remainingToDeduct -= qtyDeducted;

          item.customizations?.forEach(jar => {
            if (jar.additive_id !== "empty" && jar.weight_grams > 0) {
              const weightToDeduct = (jar.weight_grams * qtyDeducted) / 1000;
              let addSt = stocks.find(s => s.additive_id === jar.additive_id && s.storage_location_id === st.storage_location_id && s.deleted_at === null);
              if (!addSt) {
                addSt = {
                  id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                  product_id: null,
                  additive_id: jar.additive_id,
                  storage_location_id: st.storage_location_id,
                  quantity: 0,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  deleted_at: null
                };
                stocks.push(addSt);
              }
              addSt.quantity -= weightToDeduct;
              addSt.updated_at = new Date().toISOString();
            }
          });
        }

        if (remainingToDeduct > 0 && isPreOrder) {
          const locations = getStorageItem<StorageLocation[]>("locations", initialLocations);
          const firstLoc = locations.find(l => l.deleted_at === null) || locations[0];
          
          if (firstLoc) {
            let activeBoxSt = activeProductStocks.find(s => s.storage_location_id === firstLoc.id);
            if (!activeBoxSt) {
              activeBoxSt = {
                id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                product_id: item.productId,
                additive_id: null,
                storage_location_id: firstLoc.id,
                quantity: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null
              };
              stocks.push(activeBoxSt);
            }
            activeBoxSt.quantity -= remainingToDeduct;
            activeBoxSt.updated_at = new Date().toISOString();

            item.customizations?.forEach(jar => {
              if (jar.additive_id !== "empty" && jar.weight_grams > 0) {
                const weightToDeduct = (jar.weight_grams * remainingToDeduct) / 1000;
                let addSt = stocks.find(s => s.additive_id === jar.additive_id && s.storage_location_id === firstLoc.id && s.deleted_at === null);
                if (!addSt) {
                  addSt = {
                    id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                    product_id: null,
                    additive_id: jar.additive_id,
                    storage_location_id: firstLoc.id,
                    quantity: 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    deleted_at: null
                  };
                  stocks.push(addSt);
                }
                addSt.quantity -= weightToDeduct;
                addSt.updated_at = new Date().toISOString();
              }
            });
          }
        }
      } else if (item.additiveId) {
        let remainingToDeduct = item.quantity;
        const activeAddStocks = stocks.filter(st => st.additive_id === item.additiveId && st.deleted_at === null);
        
        for (const st of activeAddStocks) {
          if (remainingToDeduct <= 0) break;
          const qtyDeducted = Math.min(st.quantity, remainingToDeduct);
          st.quantity -= qtyDeducted;
          st.updated_at = new Date().toISOString();
          remainingToDeduct -= qtyDeducted;
        }

        if (remainingToDeduct > 0 && isPreOrder) {
          const locations = getStorageItem<StorageLocation[]>("locations", initialLocations);
          const firstLoc = locations.find(l => l.deleted_at === null) || locations[0];
          if (firstLoc) {
            let activeAddSt = activeAddStocks.find(s => s.storage_location_id === firstLoc.id);
            if (!activeAddSt) {
              activeAddSt = {
                id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                product_id: null,
                additive_id: item.additiveId,
                storage_location_id: firstLoc.id,
                quantity: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null
              };
              stocks.push(activeAddSt);
            }
            activeAddSt.quantity -= remainingToDeduct;
            activeAddSt.updated_at = new Date().toISOString();
          }
        }
      }
      
      return {
        id: `ivi-${Date.now()}-${indexVal}-${Math.random().toString(36).substring(2, 7)}`,
        invoice_id: id,
        product_id: item.productId,
        additive_id: item.additiveId || null,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount: discountVal,
        total_price: totalPrice,
        customizations: item.customizations,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      };
    });
    
    // 4. Update the invoices and invoice_items storage
    invoices[idx].customer_name = customerName;
    invoices[idx].customer_phone = customerPhone || undefined;
    invoices[idx].total_amount = totalAmount;
    invoices[idx].status = status;
    invoices[idx].delivery_date = deliveryDate || undefined;
    invoices[idx].advance_paid = advancePaid !== undefined ? Number(advancePaid) : undefined;
    invoices[idx].payment_mode = paymentMode || "Cash";
    invoices[idx].device_info = deviceInfo || invoices[idx].device_info || null;
    invoices[idx].created_by_user_id = user?.id || invoices[idx].created_by_user_id;
    invoices[idx].created_by_username = user?.username || invoices[idx].created_by_username;
    invoices[idx].updated_at = new Date().toISOString();
    
    const cleanedItems = invoiceItems.filter(ivi => ivi.invoice_id !== id);
    cleanedItems.push(...updatedItems);
    
    setStorageItem("invoices", invoices);
    setStorageItem("invoice_items", cleanedItems);
    setStorageItem("stock", stocks);
    
    return {
      ...invoices[idx],
      items: updatedItems
    };
  }

  getAdditives(): Additive[] {
    const list = getStorageItem<Additive[]>("additives", initialAdditives).filter(a => !a.deleted_at);
    const stocks = getStorageItem<Stock[]>("stock", initialStock);
    const locations = getStorageItem<StorageLocation[]>("locations", initialLocations);
    const firstLoc = locations.find(l => !l.deleted_at) || locations[0];
    let stocksUpdated = false;
    let additivesUpdated = false;

    const result = list.map(a => {
      const activeStocks = stocks.filter(st => st.additive_id === a.id && !st.deleted_at);
      if (activeStocks.length > 0) {
        const totalStock = activeStocks.reduce((sum, s) => sum + Number(s.quantity || 0), 0);
        if (a.stock_qty_kg !== totalStock) {
          a.stock_qty_kg = totalStock;
          additivesUpdated = true;
        }
        return {
          ...a,
          stock_qty_kg: totalStock
        };
      } else if (firstLoc) {
        // Auto-heal missing location stock record for active additive
        const newStockQty = Number(a.stock_qty_kg || 0);
        stocks.push({
          id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          product_id: null,
          additive_id: a.id,
          storage_location_id: firstLoc.id,
          quantity: newStockQty,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null
        });
        stocksUpdated = true;
        return {
          ...a,
          stock_qty_kg: newStockQty
        };
      }
      return a;
    });

    if (stocksUpdated) {
      setStorageItem("stock", stocks);
    }
    if (additivesUpdated) {
      setStorageItem("additives", list);
    }
    return result;
  }

  addAdditive(name: string, pricePerKg: number, stockQtyKg: number = 0, callerUser?: any): Additive {
    const user = callerUser || this.getCurrentSessionUser();
    if (user && user.role !== 'super_admin' && !user.rights.edit_inventory) {
      throw new Error('Unauthorized: Your user account lacks permission to modify inventory.');
    }
    const list = getStorageItem<Additive[]>("additives", initialAdditives);
    const nameLower = name.trim().toLowerCase();
    const exists = list.some(a => a.name.toLowerCase() === nameLower && !a.deleted_at);
    if (exists) throw new Error(`Additive "${name.trim()}" already exists.`);

    const newItem: Additive = {
      id: `add-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      price_per_kg: Number(pricePerKg),
      stock_qty_kg: Number(stockQtyKg),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
    list.push(newItem);
    setStorageItem("additives", list);

    const stocks = getStorageItem<Stock[]>("stock", initialStock);
    const locations = getStorageItem<StorageLocation[]>("locations", initialLocations);
    const firstLoc = locations.find(l => !l.deleted_at) || locations[0];
    if (firstLoc) {
      const existingStIdx = stocks.findIndex(s => s.additive_id === newItem.id && !s.deleted_at);
      if (existingStIdx >= 0) {
        stocks[existingStIdx].quantity = Number(stockQtyKg);
        stocks[existingStIdx].updated_at = new Date().toISOString();
      } else {
        stocks.push({
          id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          product_id: null,
          additive_id: newItem.id,
          storage_location_id: firstLoc.id,
          quantity: Number(stockQtyKg),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null
        });
      }
      setStorageItem("stock", stocks);
    }
    return newItem;
  }

  updateAdditive(id: string, name: string, pricePerKg: number, stockQtyKg: number, callerUser?: any): Additive | null {
    const user = callerUser || this.getCurrentSessionUser();
    if (user && user.role !== 'super_admin' && !user.rights.edit_inventory) {
      throw new Error('Unauthorized: Your user account lacks permission to modify inventory.');
    }
    const list = getStorageItem<Additive[]>("additives", initialAdditives);
    const nameLower = name.trim().toLowerCase();
    const exists = list.some(a => a.id !== id && a.name.toLowerCase() === nameLower && !a.deleted_at);
    if (exists) throw new Error(`Additive "${name.trim()}" already exists.`);

    const idx = list.findIndex(a => a.id === id);
    if (idx >= 0) {
      list[idx].name = name.trim();
      list[idx].price_per_kg = Number(pricePerKg);
      list[idx].stock_qty_kg = Number(stockQtyKg);
      list[idx].updated_at = new Date().toISOString();
      setStorageItem("additives", list);

      // Keep location stock table in sync
      const stocks = getStorageItem<Stock[]>("stock", initialStock);
      const locations = getStorageItem<StorageLocation[]>("locations", initialLocations);
      const firstLoc = locations.find(l => !l.deleted_at) || locations[0];
      if (firstLoc) {
        const stIdx = stocks.findIndex(s => s.additive_id === id && !s.deleted_at);
        if (stIdx >= 0) {
          stocks[stIdx].quantity = Number(stockQtyKg);
          stocks[stIdx].updated_at = new Date().toISOString();
        } else {
          stocks.push({
            id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            product_id: null,
            additive_id: id,
            storage_location_id: firstLoc.id,
            quantity: Number(stockQtyKg),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null
          });
        }
        setStorageItem("stock", stocks);
      }

      return list[idx];
    }
    return null;
  }

  getDamagedStock(): DamagedStock[] {
    return getStorageItem<DamagedStock[]>("damaged_stock", initialDamagedStock).filter(d => d.deleted_at === null);
  }

  addDamagedStock(productId: string | null, locationId: string, quantity: number, additiveId: string | null = null, callerUser?: any): DamagedStock {
    const user = callerUser || this.getCurrentSessionUser();
    if (user && user.role !== 'super_admin' && !user.rights.edit_inventory) {
      throw new Error('Unauthorized: Your user account lacks permission to modify inventory.');
    }
    if (quantity <= 0 || isNaN(quantity)) {
      throw new Error('Invalid damaged stock quantity. Quantity must be greater than zero.');
    }
    const stocks = getStorageItem<Stock[]>("stock", initialStock);
    const stIndex = stocks.findIndex(
      s => s.product_id === productId && 
           s.additive_id === additiveId && 
           s.storage_location_id === locationId && 
           s.deleted_at === null
    );
    
    if (stIndex < 0 || stocks[stIndex].quantity < quantity) {
      const available = stIndex >= 0 ? stocks[stIndex].quantity : 0;
      throw new Error(`Insufficient stock to mark as damaged. Requested: ${quantity}, Available: ${available}`);
    }

    stocks[stIndex].quantity -= quantity;
    stocks[stIndex].updated_at = new Date().toISOString();
    setStorageItem("stock", stocks);

    const list = getStorageItem<DamagedStock[]>("damaged_stock", initialDamagedStock);
    const newItem: DamagedStock = {
      id: `dmg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      product_id: productId,
      additive_id: additiveId,
      storage_location_id: locationId,
      quantity,
      reported_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
    list.push(newItem);
    setStorageItem("damaged_stock", list);

    const itemName = productId 
      ? (getStorageItem<Product[]>("products", initialProducts).find(p => p.id === productId)?.name || "Product")
      : (getStorageItem<Additive[]>("additives", initialAdditives).find(a => a.id === additiveId)?.name || "Dryfruit");

    const locName = getStorageItem<StorageLocation[]>("locations", initialLocations).find(l => l.id === locationId)?.name || "Location";

    this.logStockMovement(
      itemName,
      productId ? "product" : "dryfruit",
      quantity,
      "damaged",
      locName,
      undefined,
      user?.username || "System"
    );

    return newItem;
  }

  clearAll(): void {
    if (typeof window === "undefined") return;
    const clearTimestamp = Date.now();
    window.localStorage.setItem("jenny_last_cleared_at", String(clearTimestamp));
    window.localStorage.setItem("jenny_db_last_known_version", "0");

    // Only clear transactional data; PRESERVE structural data (categories, sub_types, locations, additives, users)
    setStorageItem("products", []);
    setStorageItem("stock", []);
    setStorageItem("invoices", []);
    setStorageItem("invoice_items", []);
    setStorageItem("damaged_stock", []);
    setStorageItem("stock_movements", []);

    const deviceId = typeof window !== "undefined" ? (window.localStorage.getItem("jenny_device_fingerprint_id") || "DEV-CLIENT") : "DEV-CLIENT";
    let username = "Guest";
    let userRole = "operator";
    try {
      if (typeof window !== "undefined") {
        const sessionUser = window.localStorage.getItem("jenny_session_user") || window.sessionStorage.getItem("jenny_session_user");
        if (sessionUser) {
          const parsed = JSON.parse(sessionUser);
          if (parsed && parsed.username) username = parsed.username;
          if (parsed && parsed.role) userRole = parsed.role;
        }
      }
    } catch (err) {}

    fetch("/api/db", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
        "x-username": username,
        "x-user-role": userRole,
        "x-user-agent": typeof navigator !== "undefined" ? navigator.userAgent : "Browser"
      },
      body: JSON.stringify({ key: "_clear_all", value: clearTimestamp })
    }).catch(err => console.error("Server sandbox clear POST failed:", err));

    // If Supabase is connected, wipe only transactional cloud tables
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      setTimeout(async () => {
        try {
          await client.from("invoice_items").delete().neq("id", "_");
          await client.from("invoices").delete().neq("id", "_");
          await client.from("damaged_stock").delete().neq("id", "_");
          await client.from("stock").delete().neq("id", "_");
          await client.from("products").delete().neq("id", "_");
          console.log("Supabase transactional tables successfully truncated.");
        } catch (err) {
          console.error("Failed to truncate Supabase transactional tables:", err);
        }
      }, 0);
    }
  }

  getSellerSettings(): SellerSettings {
    const defaultSettings: SellerSettings = {
      seller_name: "Jenny's Creation",
      seller_address: "123 Creative Street, Studio City",
      gstin: "24AAACJ1234A1Z5",
      pan: "ABCDE1234F",
      show_gst_pan: false
    };
    return getStorageItem<SellerSettings>("seller_settings", defaultSettings);
  }

  saveSellerSettings(settings: SellerSettings): void {
    setStorageItem("seller_settings", settings);
    if (isSupabaseConfigured) {
      this.syncToSupabase("seller_settings", settings).catch(err => console.warn("Supabase sync notice on seller settings:", err));
    }
    this.logAudit("UPDATE_SELLER_SETTINGS", `Updated seller business profile (${settings.seller_name})`);
  }

  // --- AUDIT LOGGING ---
  logAudit(action: string, details: string, callerUser?: any): AuditLog {
    const user = callerUser || this.getCurrentSessionUser();
    const logs = getStorageItem<AuditLog[]>("audit_logs", []);
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: user?.id,
      username: user?.username || "System",
      action,
      details,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    setStorageItem("audit_logs", logs.slice(0, 500));
    return newLog;
  }

  getAuditLogs(): AuditLog[] {
    return getStorageItem<AuditLog[]>("audit_logs", []);
  }

  // --- RECYCLE BIN / TRASH RECOVERY ---
  getTrashBinItems(): TrashBinItem[] {
    const items: TrashBinItem[] = [];

    const prods = getStorageItem<Product[]>("products", initialProducts);
    prods.filter(p => p.deleted_at !== null).forEach(p => items.push({ id: p.id, type: "product", name: p.name, deleted_at: p.deleted_at! }));

    const cats = getStorageItem<Category[]>("categories", initialCategories);
    cats.filter(c => c.deleted_at !== null).forEach(c => items.push({ id: c.id, type: "category", name: c.name, deleted_at: c.deleted_at! }));

    const subs = getStorageItem<SubType[]>("sub_types", initialSubTypes);
    subs.filter(s => s.deleted_at !== null).forEach(s => items.push({ id: s.id, type: "sub_type", name: s.name, deleted_at: s.deleted_at! }));

    const locs = getStorageItem<StorageLocation[]>("locations", initialLocations);
    locs.filter(l => l.deleted_at !== null).forEach(l => items.push({ id: l.id, type: "location", name: l.name, deleted_at: l.deleted_at! }));

    const adds = getStorageItem<Additive[]>("additives", initialAdditives);
    adds.filter(a => a.deleted_at !== null).forEach(a => items.push({ id: a.id, type: "additive", name: a.name, deleted_at: a.deleted_at! }));

    const invs = getStorageItem<Invoice[]>("invoices", initialInvoices);
    invs.filter(i => i.deleted_at !== null).forEach(i => items.push({ id: i.id, type: "invoice", name: `${i.invoice_number} - ${i.customer_name}`, deleted_at: i.deleted_at! }));

    return items.sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime());
  }

  permanentlyDelete(type: string, id: string, callerUser?: any): boolean {
    const user = callerUser || this.getCurrentSessionUser();
    if (user && user.role !== 'super_admin') {
      throw new Error("Unauthorized: Only Super Admins can permanently delete items.");
    }
    const tableKeyMap: { [t: string]: { key: string; initial: any } } = {
      product: { key: "products", initial: initialProducts },
      category: { key: "categories", initial: initialCategories },
      sub_type: { key: "sub_types", initial: initialSubTypes },
      location: { key: "locations", initial: initialLocations },
      additive: { key: "additives", initial: initialAdditives },
      invoice: { key: "invoices", initial: initialInvoices }
    };

    const target = tableKeyMap[type];
    if (!target) return false;

    const list = getStorageItem<any[]>(target.key, target.initial);
    const filtered = list.filter(item => item.id !== id);
    if (filtered.length < list.length) {
      setStorageItem(target.key, filtered);
      this.logAudit("PERMANENT_DELETE", `Permanently purged ${type} record (${id})`, user);
      return true;
    }
    return false;
  }

  // --- CUSTOM LOW STOCK THRESHOLDS ---
  getCustomThresholds(): { [itemId: string]: number } {
    return getStorageItem<{ [itemId: string]: number }>("custom_stock_thresholds", {});
  }

  setCustomThreshold(itemId: string, minThreshold: number, callerUser?: any): void {
    const user = callerUser || this.getCurrentSessionUser();
    if (user && user.role !== 'super_admin' && !user.rights.edit_inventory) {
      throw new Error("Unauthorized: Your account lacks permission to modify stock thresholds.");
    }
    if (minThreshold < 0 || isNaN(minThreshold)) {
      throw new Error("Stock threshold cannot be negative.");
    }
    const thresholds = this.getCustomThresholds();
    thresholds[itemId] = minThreshold;
    setStorageItem("custom_stock_thresholds", thresholds);
    this.logAudit("UPDATE_THRESHOLD", `Updated low stock threshold for item ${itemId} to ${minThreshold}`, user);
  }

  // --- SESSION SECURITY CONTROL ---
  forceLogoutDevice(deviceId: string, callerUser?: any): boolean {
    const user = callerUser || this.getCurrentSessionUser();
    if (user && user.role !== 'super_admin') {
      throw new Error("Unauthorized: Only Super Admins can force logout devices.");
    }
    const active = getStorageItem<any[]>("active_devices", []);
    const updated = active.filter((d: any) => d.deviceId !== deviceId);
    setStorageItem("active_devices", updated);
    this.logAudit("FORCE_LOGOUT", `Forced session termination for device ${deviceId}`, user);
    return true;
  }

  resetSeed(): void {
    if (typeof window === "undefined") return;
    setStorageItem("categories", initialCategories);
    setStorageItem("sub_types", initialSubTypes);
    setStorageItem("locations", initialLocations);
    setStorageItem("products", initialProducts);
    setStorageItem("stock", initialStock);
    setStorageItem("invoices", initialInvoices);
    setStorageItem("invoice_items", initialInvoiceItems);
    setStorageItem("additives", initialAdditives);
    setStorageItem("damaged_stock", initialDamagedStock);
    setStorageItem("users", initialUsers);
  }

  // --- AUTOMATED 3-DAY ROLLING BACKUP ENGINE (FIFO MAX 3 DAYS) ---
  getBackupSnapshots(): any[] {
    if (typeof window === "undefined") return [];
    return getStorageItem<any[]>("backup_snapshots", []);
  }

  createBackupSnapshot(): any {
    if (typeof window === "undefined") return null;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const createdAt = now.toISOString();

    const invoices = getStorageItem<Invoice[]>("invoices", initialInvoices).filter(i => i.deleted_at === null);
    const invoiceItems = getStorageItem<InvoiceItem[]>("invoice_items", initialInvoiceItems).filter(i => i.deleted_at === null);
    const categories = getStorageItem<Category[]>("categories", initialCategories).filter(c => c.deleted_at === null);
    const subTypes = getStorageItem<SubType[]>("sub_types", initialSubTypes).filter(s => s.deleted_at === null);
    const products = getStorageItem<Product[]>("products", initialProducts).filter(p => p.deleted_at === null);
    const additives = getStorageItem<Additive[]>("additives", initialAdditives).filter(a => a.deleted_at === null);
    const locations = getStorageItem<StorageLocation[]>("locations", initialLocations).filter(l => l.deleted_at === null);

    const snapshotData = {
      invoices,
      invoice_items: invoiceItems,
      categories,
      sub_types: subTypes,
      products,
      additives,
      locations
    };

    const jsonString = JSON.stringify(snapshotData);
    const sizeKb = Math.round(jsonString.length / 1024 * 10) / 10;

    const newSnapshot = {
      id: `snap-${dateStr}-${Date.now().toString(36)}`,
      date_str: dateStr,
      created_at: createdAt,
      invoices_count: invoices.length,
      catalog_count: products.length + categories.length + subTypes.length + additives.length,
      size_kb: sizeKb,
      data: snapshotData
    };

    const snapshots = this.getBackupSnapshots();
    // Filter out any existing snapshot for today to replace it with latest state
    const filtered = snapshots.filter((s: any) => s.date_str !== dateStr);
    
    // Add new snapshot at top (latest first)
    const updated = [newSnapshot, ...filtered];

    // Enforce 3-day rolling FIFO limit (keep only 3 latest daily snapshots, delete older ones)
    const rollingSnapshots = updated.slice(0, 3);
    setStorageItem("backup_snapshots", rollingSnapshots);

    return newSnapshot;
  }

  runAutomatedDailyBackup(): void {
    if (typeof window === "undefined") return;
    const snapshots = this.getBackupSnapshots();
    const todayStr = new Date().toISOString().slice(0, 10);
    const hasTodayBackup = snapshots.some((s: any) => s.date_str === todayStr);

    if (!hasTodayBackup) {
      this.createBackupSnapshot();
      console.log(`[Backup Engine] Automatically created daily rolling backup for ${todayStr}. Total active rolling snapshots: ${Math.min(snapshots.length + 1, 3)}/3`);
    }
  }

  restoreBackupSnapshot(snapshotId: string): boolean {
    if (typeof window === "undefined") return false;
    const snapshots = this.getBackupSnapshots();
    const target = snapshots.find((s: any) => s.id === snapshotId);
    if (!target || !target.data) return false;

    if (target.data.invoices) setStorageItem("invoices", target.data.invoices);
    if (target.data.invoice_items) setStorageItem("invoice_items", target.data.invoice_items);
    if (target.data.categories) setStorageItem("categories", target.data.categories);
    if (target.data.sub_types) setStorageItem("sub_types", target.data.sub_types);
    if (target.data.products) setStorageItem("products", target.data.products);
    if (target.data.additives) setStorageItem("additives", target.data.additives);
    if (target.data.locations) setStorageItem("locations", target.data.locations);

    if (isSupabaseConfigured) {
      this.syncToSupabase("invoices", target.data.invoices);
      this.syncToSupabase("products", target.data.products);
    }
    return true;
  }

  // --- LOW DATA MODE PREFERENCE (DEFAULT ON) ---
  isLowDataMode(): boolean {
    if (typeof window === "undefined") return true; // ON by default
    const pref = window.localStorage.getItem("jenny_low_data_mode");
    return pref === null ? true : pref === "true";
  }

  setLowDataMode(enabled: boolean): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("jenny_low_data_mode", enabled ? "true" : "false");
  }
}

export const localDB = new LocalDB();
