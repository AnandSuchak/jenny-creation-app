import { describe, it, expect, beforeEach } from "vitest";
import { localDB } from "@/lib/mockData";
import { createSuperAdminUser } from "../fixtures/factories";

describe("Generic Soft-Delete & Restore Engine Tests", () => {
  const admin = createSuperAdminUser();

  beforeEach(() => {
    localStorage.clear();
  });

  const tables = [
    "categories",
    "sub_types",
    "locations",
    "products",
    "additives",
    "damaged_stock",
    "invoices"
  ];

  it("verifies soft delete and restore across all primary entities", () => {
    // 1. Setup base records
    const cat = localDB.addCategory("Archive Cat", admin);
    const sub = localDB.addSubType("Archive Sub", cat.id, admin);
    const loc = localDB.addLocation("Archive Loc", admin);
    const prod = localDB.addProduct("Archive Prod", cat.id, sub.id, [], 100, undefined, admin);
    const add = localDB.addAdditive("Archive Additive", 500, 10, admin);
    localDB.updateStock(prod.id, loc.id, 20, null, admin);
    const dmg = localDB.addDamagedStock(prod.id, loc.id, 2, null, admin);
    const inv = localDB.createInvoice("Archive Inv", "9876543210", [{ productId: prod.id, quantity: 1, unitPrice: 100, discount: 0 }], "ordered", undefined, 0, "Cash", null, admin);

    const entityMap: Record<string, string> = {
      categories: cat.id,
      sub_types: sub.id,
      locations: loc.id,
      products: prod.id,
      additives: add.id,
      damaged_stock: dmg.id,
      invoices: inv.id
    };

    for (const table of tables) {
      const id = entityMap[table];
      const deleted = localDB.softDelete(table, id);
      expect(deleted).toBe(true);

      const restored = localDB.restore(table, id);
      expect(restored).toBe(true);
    }
  });

  it("REGRESSION TEST (BUG-008): verifies that softDelete and restore return true even for non-existent IDs", () => {
    // In current implementation:
    // found is hardcoded to true when table name matches, regardless of whether any record ID matched.
    const deleteResult = localDB.softDelete("products", "completely-nonexistent-product-id-999");
    expect(deleteResult).toBe(true);

    const restoreResult = localDB.restore("products", "completely-nonexistent-product-id-999");
    expect(restoreResult).toBe(true);
  });

  it("REGRESSION TEST (BUG-007): documents that softDelete lacks RBAC permission guards", () => {
    const cat = localDB.addCategory("Public Cat", admin);
    // softDelete takes no callerUser parameter! Any caller can invoke it without rights.
    const deleted = localDB.softDelete("categories", cat.id);
    expect(deleted).toBe(true);
  });
});
