import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Force Next.js to run this route dynamically and disable caching
export const dynamic = "force-dynamic";

const dbFilePath = path.join(process.cwd(), "database.json");

const defaultCategories = [
  { id: "cat-1", name: "Box", created_at: "2026-09-28T20:00:00.000Z", updated_at: "2026-09-28T20:00:00.000Z", deleted_at: null },
  { id: "cat-2", name: "Puttha", created_at: "2026-09-28T20:00:00.000Z", updated_at: "2026-09-28T20:00:00.000Z", deleted_at: null },
  { id: "cat-3", name: "Laser Cutting", created_at: "2026-09-28T20:00:00.000Z", updated_at: "2026-09-28T20:00:00.000Z", deleted_at: null },
  { id: "cat-4", name: "Basket", created_at: "2026-09-28T20:00:00.000Z", updated_at: "2026-09-28T20:00:00.000Z", deleted_at: null }
];

const defaultSubTypes = [
  { id: "sub-1", category_id: "cat-1", name: "2 JAR", created_at: "2026-09-28T20:00:00.000Z", updated_at: "2026-09-28T20:00:00.000Z", deleted_at: null },
  { id: "sub-2", category_id: "cat-2", name: "6 Box", created_at: "2026-09-28T20:00:00.000Z", updated_at: "2026-09-28T20:00:00.000Z", deleted_at: null },
  { id: "sub-3", category_id: "cat-3", name: "Peacock Design", created_at: "2026-09-28T20:00:00.000Z", updated_at: "2026-09-28T20:00:00.000Z", deleted_at: null },
  { id: "sub-4", category_id: "cat-4", name: "Peacock Design", created_at: "2026-09-28T20:00:00.000Z", updated_at: "2026-09-28T20:00:00.000Z", deleted_at: null }
];

const defaultLocations = [
  { id: "loc-1", name: "Warehouse 1", created_at: "2026-09-28T20:00:00.000Z", updated_at: "2026-09-28T20:00:00.000Z", deleted_at: null },
  { id: "loc-2", name: "Warehouse 2", created_at: "2026-09-28T20:00:00.000Z", updated_at: "2026-09-28T20:00:00.000Z", deleted_at: null },
  { id: "loc-3", name: "Warehouse 3", created_at: "2026-09-28T20:00:00.000Z", updated_at: "2026-09-28T20:00:00.000Z", deleted_at: null },
  { id: "loc-4", name: "Warehouse 4", created_at: "2026-09-28T20:00:00.000Z", updated_at: "2026-09-28T20:00:00.000Z", deleted_at: null },
  { id: "loc-5", name: "Display", created_at: "2026-09-28T20:00:00.000Z", updated_at: "2026-09-28T20:00:00.000Z", deleted_at: null }
];

const defaultAdditives = [
  { id: "add-1", name: "Kaju", price_per_kg: 800, stock_qty_kg: 10, created_at: "2026-09-28T20:00:00.000Z", updated_at: "2026-09-28T20:00:00.000Z", deleted_at: null },
  { id: "add-2", name: "Badam", price_per_kg: 900, stock_qty_kg: 15, created_at: "2026-09-28T20:00:00.000Z", updated_at: "2026-09-28T20:00:00.000Z", deleted_at: null },
  { id: "add-3", name: "Pista", price_per_kg: 1200, stock_qty_kg: 5, created_at: "2026-09-28T20:00:00.000Z", updated_at: "2026-09-28T20:00:00.000Z", deleted_at: null },
  { id: "add-4", name: "Kismis", price_per_kg: 400, stock_qty_kg: 8, created_at: "2026-09-28T20:00:00.000Z", updated_at: "2026-09-28T20:00:00.000Z", deleted_at: null },
  { id: "add-5", name: "Rabdi Kaju", price_per_kg: 1400, stock_qty_kg: 12, created_at: "2026-09-28T20:00:00.000Z", updated_at: "2026-09-28T20:00:00.000Z", deleted_at: null }
];

// Helper to read database file
const readDB = () => {
  if (!fs.existsSync(dbFilePath)) {
    return {
      categories: defaultCategories,
      sub_types: defaultSubTypes,
      locations: defaultLocations,
      additives: defaultAdditives
    };
  }
  try {
    const content = fs.readFileSync(dbFilePath, "utf8");
    const data = JSON.parse(content);
    if (!data.categories || data.categories.length === 0) data.categories = defaultCategories;
    if (!data.sub_types || data.sub_types.length === 0) data.sub_types = defaultSubTypes;
    if (!data.locations || data.locations.length === 0) data.locations = defaultLocations;
    if (!data.additives || data.additives.length === 0) data.additives = defaultAdditives;
    return data;
  } catch (e) {
    console.error("Error reading database file:", e);
    return {
      categories: defaultCategories,
      sub_types: defaultSubTypes,
      locations: defaultLocations,
      additives: defaultAdditives
    };
  }
};

// Helper to write database file
const writeDB = (data: any) => {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("Error writing database file:", e);
  }
};

// Helper to register device heartbeat and prune dead nodes (older than 15s)
const updateActiveDevices = (currentData: any, request: Request) => {
  const deviceId = request.headers.get("x-device-id");
  if (!deviceId) return currentData.active_devices || [];

  const username = request.headers.get("x-username") || "Guest";
  const userAgent = request.headers.get("x-user-agent") || "Unknown Browser";
  const ipAddress = request.headers.get("x-ip-address") || "Unknown IP";

  const now = Date.now();
  let devices = currentData.active_devices || [];
  if (!Array.isArray(devices)) devices = [];

  // Filter out expired devices (inactive for > 15s)
  devices = devices.filter((d: any) => d && d.deviceId && (now - d.lastSeen) < 15000);

  // Update or insert current device session
  const existingIdx = devices.findIndex((d: any) => d.deviceId === deviceId);
  if (existingIdx > -1) {
    devices[existingIdx] = {
      deviceId,
      username,
      userAgent,
      ipAddress,
      lastSeen: now
    };
  } else {
    devices.push({
      deviceId,
      username,
      userAgent,
      ipAddress,
      lastSeen: now
    });
  }

  currentData.active_devices = devices;
  return devices;
};

export async function GET(request: Request) {
  const data = readDB();
  const activeDevices = updateActiveDevices(data, request);
  
  // Ensure _last_updated timestamp exists in memory
  if (!data._last_updated) {
    try {
      data._last_updated = fs.existsSync(dbFilePath) 
        ? fs.statSync(dbFilePath).mtimeMs 
        : Date.now();
    } catch {
      data._last_updated = Date.now();
    }
  }

  const knownVersion = request.headers.get("x-known-version");
  
  // If client sent a known version and it matches current data version,
  // return a lightweight response instead of full database payload
  if (knownVersion && String(knownVersion) === String(data._last_updated)) {
    return NextResponse.json(
      { unmodified: true, _last_updated: data._last_updated, _last_cleared: data._last_cleared || 0, active_devices: activeDevices },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        }
      }
    );
  }

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    }
  });
}

const ALLOWED_KEYS = new Set([
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
  "stock_movements",
  "active_devices",
  "seller_settings",
  "audit_logs",
  "custom_stock_thresholds",
  "backup_snapshots",
  "_last_cleared",
  "_clear_all"
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key, value } = body;
    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    if (!ALLOWED_KEYS.has(key)) {
      return NextResponse.json({ error: `Unauthorized or invalid database key: ${key}` }, { status: 403 });
    }

    const deviceId = request.headers.get("x-device-id");
    const adminKey = request.headers.get("x-admin-key");

    if (!deviceId && !adminKey) {
      return NextResponse.json({ error: "Unauthenticated write request rejected." }, { status: 401 });
    }

    if (key === "_clear_all" && !adminKey) {
      const authHeader = request.headers.get("x-user-role");
      if (authHeader !== "super_admin") {
        return NextResponse.json({ error: "Super Admin authorization required for sensitive database operations." }, { status: 403 });
      }
    }

    const currentData = readDB();

    if (key === "_clear_all" || key === "_last_cleared") {
      const clearTime = typeof value === "number" ? value : Date.now();
      currentData._last_cleared = clearTime;
      currentData._last_updated = clearTime;
      currentData.products = [];
      currentData.stock = [];
      currentData.invoices = [];
      currentData.invoice_items = [];
      currentData.damaged_stock = [];
      currentData.stock_movements = [];
    } else {
      currentData[key] = value;
      if (key !== "active_devices") {
        currentData._last_updated = Date.now();
      }
    }

    updateActiveDevices(currentData, request);
    writeDB(currentData);
    
    return NextResponse.json({ 
      success: true, 
      _last_updated: currentData._last_updated,
      _last_cleared: currentData._last_cleared 
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
