import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Force Next.js to run this route dynamically and disable caching
export const dynamic = "force-dynamic";

const dbFilePath = path.join(process.cwd(), "database.json");

// Helper to read database file
const readDB = () => {
  if (!fs.existsSync(dbFilePath)) {
    return {};
  }
  try {
    const content = fs.readFileSync(dbFilePath, "utf8");
    return JSON.parse(content);
  } catch (e) {
    console.error("Error reading database file:", e);
    return {};
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
  updateActiveDevices(data, request);
  writeDB(data);
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key, value } = body;
    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }
    const currentData = readDB();
    currentData[key] = value;
    updateActiveDevices(currentData, request);
    writeDB(currentData);
    
    return NextResponse.json({ success: true }, {
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
