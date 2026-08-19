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

export async function GET() {
  const data = readDB();
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
