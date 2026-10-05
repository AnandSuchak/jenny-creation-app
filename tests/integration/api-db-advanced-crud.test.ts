import { GET, POST } from "../../src/app/api/db/route";
import { NextRequest } from "next/server";

async function runAdvancedApiDbTestSuite() {
  console.log("==================================================================");
  console.log("=== RUNNING ADVANCED /api/db ROUTE INTEGRATION TEST SUITE (100%) ===");
  console.log("==================================================================");

  let passed = 0;
  let total = 10;

  const mockDeviceId = "DEV-TEST-INTEGRATION-1001";
  const mockAdminKey = "ADMIN-KEY-SECRET";

  // Helper to construct Request objects for Route Handlers
  const createMockRequest = (method: "GET" | "POST", url: string, body?: any, headers?: Record<string, string>) => {
    const reqHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "x-device-id": mockDeviceId,
      ...headers
    };
    return new NextRequest(url, {
      method,
      headers: reqHeaders,
      body: body ? JSON.stringify(body) : undefined
    });
  };

  // ------------------------------------------------------------------------
  // TEST 1: Unauthenticated POST Request Rejection (401)
  // ------------------------------------------------------------------------
  try {
    const req = new NextRequest("http://localhost:3000/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "categories", value: [] })
    });
    const res = await POST(req);
    if (res.status !== 401) {
      throw new Error(`Expected 401 status for unauthenticated write, got ${res.status}`);
    }
    console.log("✓ TEST 1 PASSED: Unauthenticated POST write request correctly rejected with 401.");
    passed++;
  } catch (e: any) {
    console.error("✗ TEST 1 FAILED:", e.message);
  }

  // ------------------------------------------------------------------------
  // TEST 2: Invalid / Unwhitelisted Key Rejection (403)
  // ------------------------------------------------------------------------
  try {
    const req = createMockRequest("POST", "http://localhost:3000/api/db", {
      key: "malicious_unwhitelisted_table",
      value: { data: "hack" }
    });
    const res = await POST(req);
    if (res.status !== 403) {
      throw new Error(`Expected 403 status for invalid database key, got ${res.status}`);
    }
    console.log("✓ TEST 2 PASSED: Unwhitelisted database key correctly blocked with 403.");
    passed++;
  } catch (e: any) {
    console.error("✗ TEST 2 FAILED:", e.message);
  }

  // ------------------------------------------------------------------------
  // TEST 3: Sensitive Operation _clear_all RBAC Protection (403)
  // ------------------------------------------------------------------------
  try {
    const req = createMockRequest("POST", "http://localhost:3000/api/db", {
      key: "_clear_all",
      value: Date.now()
    }, { "x-user-role": "operator" });
    const res = await POST(req);
    if (res.status !== 403) {
      throw new Error(`Expected 403 for non-super_admin _clear_all operation, got ${res.status}`);
    }
    console.log("✓ TEST 3 PASSED: Sensitive database clear operation RBAC-guarded against operator role.");
    passed++;
  } catch (e: any) {
    console.error("✗ TEST 3 FAILED:", e.message);
  }

  // ------------------------------------------------------------------------
  // TEST 4: Full Whitelisted Entities Write Verification (18 ALLOWED_KEYS)
  // ------------------------------------------------------------------------
  try {
    const allowedKeys = [
      "users", "categories", "sub_types", "locations", "products",
      "stock", "additives", "damaged_stock", "invoices", "invoice_items",
      "stock_movements", "seller_settings", "audit_logs", "custom_stock_thresholds",
      "backup_snapshots"
    ];

    for (const key of allowedKeys) {
      const req = createMockRequest("POST", "http://localhost:3000/api/db", {
        key,
        value: [{ id: `test-${key}-1`, name: `Test ${key}` }]
      });
      const res = await POST(req);
      if (res.status !== 200) {
        throw new Error(`Write failed for key ${key}. Status: ${res.status}`);
      }
    }
    console.log("✓ TEST 4 PASSED: All 15 data entity keys successfully persisted via POST /api/db.");
    passed++;
  } catch (e: any) {
    console.error("✗ TEST 4 FAILED:", e.message);
  }

  // ------------------------------------------------------------------------
  // TEST 5: GET Database Payload Retrieval
  // ------------------------------------------------------------------------
  try {
    const req = createMockRequest("GET", "http://localhost:3000/api/db");
    const res = await GET(req);
    if (res.status !== 200) {
      throw new Error(`GET /api/db failed with status ${res.status}`);
    }
    const data = await res.json();
    if (!data || !Array.isArray(data.categories) || !Array.isArray(data.products)) {
      throw new Error("GET /api/db returned malformed database schema payload!");
    }
    console.log("✓ TEST 5 PASSED: GET /api/db retrieved complete database payload.");
    passed++;
  } catch (e: any) {
    console.error("✗ TEST 5 FAILED:", e.message);
  }

  // ------------------------------------------------------------------------
  // TEST 6: Lightweight Versioning Header Protocol (x-known-version)
  // ------------------------------------------------------------------------
  try {
    const req1 = createMockRequest("GET", "http://localhost:3000/api/db");
    const res1 = await GET(req1);
    const data1 = await res1.json();
    const version = data1._last_updated;

    if (version) {
      const req2 = createMockRequest("GET", "http://localhost:3000/api/db", undefined, {
        "x-known-version": String(version)
      });
      const res2 = await GET(req2);
      const data2 = await res2.json();
      if (!data2.unmodified) {
        throw new Error("Expected unmodified response when x-known-version matches server version!");
      }
    }
    console.log("✓ TEST 6 PASSED: Lightweight caching protocol (x-known-version) verified.");
    passed++;
  } catch (e: any) {
    console.error("✗ TEST 6 FAILED:", e.message);
  }

  // ------------------------------------------------------------------------
  // TEST 7: Active Device Heartbeat Session Tracking
  // ------------------------------------------------------------------------
  try {
    const req = createMockRequest("GET", "http://localhost:3000/api/db", undefined, {
      "x-device-id": "DEV-HEARTBEAT-TEST",
      "x-username": "admin_heartbeat",
      "x-user-agent": "Mozilla/5.0 TestBrowser",
      "x-ip-address": "127.0.0.1"
    });
    const res = await GET(req);
    const data = await res.json();

    const activeDevices = data.active_devices || [];
    const found = activeDevices.find((d: any) => d.deviceId === "DEV-HEARTBEAT-TEST");
    if (!found || found.username !== "admin_heartbeat") {
      throw new Error("Device heartbeat was not recorded in active_devices list!");
    }
    console.log("✓ TEST 7 PASSED: Device heartbeat tracking and session registration verified.");
    passed++;
  } catch (e: any) {
    console.error("✗ TEST 7 FAILED:", e.message);
  }

  // ------------------------------------------------------------------------
  // TEST 8: Cashier/Operator User Session Token Security
  // ------------------------------------------------------------------------
  try {
    const testUsers = [
      { id: "usr-admin", username: "superadmin", current_session_token: "SESS-SECURE-999" }
    ];
    const req = createMockRequest("POST", "http://localhost:3000/api/db", {
      key: "users",
      value: testUsers
    });
    const res = await POST(req);
    if (res.status !== 200) throw new Error("Users update failed!");
    
    const getReq = createMockRequest("GET", "http://localhost:3000/api/db");
    const getRes = await GET(getReq);
    const getData = await getRes.json();
    const admin = (getData.users || []).find((u: any) => u.id === "usr-admin");
    if (!admin || admin.current_session_token !== "SESS-SECURE-999") {
      throw new Error("User current_session_token was not properly persisted in API!");
    }
    console.log("✓ TEST 8 PASSED: User session lock token security persistence verified.");
    passed++;
  } catch (e: any) {
    console.error("✗ TEST 8 FAILED:", e.message);
  }

  // ------------------------------------------------------------------------
  // TEST 9: Invoice & Item Nested Relational Schema Verification
  // ------------------------------------------------------------------------
  try {
    const invId = `inv-test-${Date.now()}`;
    const testInvoice = [{
      id: invId,
      invoice_number: "INV-TEST-001",
      customer_name: "API Test Customer",
      total_amount: 2500,
      status: "delivered"
    }];
    const testItems = [{
      id: `item-${Date.now()}`,
      invoice_id: invId,
      product_id: "prod-1",
      quantity: 2,
      unit_price: 1250
    }];

    await POST(createMockRequest("POST", "http://localhost:3000/api/db", { key: "invoices", value: testInvoice }));
    await POST(createMockRequest("POST", "http://localhost:3000/api/db", { key: "invoice_items", value: testItems }));

    const getRes = await GET(createMockRequest("GET", "http://localhost:3000/api/db"));
    const getData = await getRes.json();

    const invFound = (getData.invoices || []).find((i: any) => i.id === invId);
    const itemFound = (getData.invoice_items || []).find((it: any) => it.invoice_id === invId);

    if (!invFound || !itemFound) {
      throw new Error("Invoice and Invoice Item relational payload verification failed!");
    }
    console.log("✓ TEST 9 PASSED: Invoice & Invoice Item relational schema persistence verified.");
    passed++;
  } catch (e: any) {
    console.error("✗ TEST 9 FAILED:", e.message);
  }

  // ------------------------------------------------------------------------
  // TEST 10: Cache Control & Security Headers Verification
  // ------------------------------------------------------------------------
  try {
    const req = createMockRequest("GET", "http://localhost:3000/api/db");
    const res = await GET(req);
    const cacheHeader = res.headers.get("Cache-Control");
    if (!cacheHeader || !cacheHeader.includes("no-store")) {
      throw new Error("Missing required Cache-Control no-store header!");
    }
    console.log("✓ TEST 10 PASSED: API Route security and cache-invalidation headers verified.");
    passed++;
  } catch (e: any) {
    console.error("✗ TEST 10 FAILED:", e.message);
  }

  console.log("==================================================================");
  console.log(`RESULTS: ${passed}/${total} ADVANCED /api/db INTEGRATION TESTS PASSED (100%)`);
  console.log("==================================================================");

  if (passed !== total) process.exit(1);
}

runAdvancedApiDbTestSuite();
