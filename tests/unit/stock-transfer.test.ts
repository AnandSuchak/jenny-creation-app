import { describe, it, expect, beforeEach } from "vitest";
import { localDB } from "@/lib/mockData";
import { createSuperAdminUser, createRestrictedOperator } from "../fixtures/factories";

describe("Stock Transfer & Conservation Invariant Tests", () => {
  const admin = createSuperAdminUser();
  let prodId: string;
  let locA: string;
  let locB: string;

  beforeEach(() => {
    const uid = Math.random().toString(36).substring(2, 7);
    const cat = localDB.addCategory(`Transfer Categories ${uid}`, admin);
    const sub = localDB.addSubType(`3 Jar ${uid}`, cat.id, admin);
    const prod = localDB.addProduct(`Transferable Hamper ${uid}`, cat.id, sub.id, [], 700, undefined, admin);
    const lA = localDB.addLocation(`Source Depot A ${uid}`, admin);
    const lB = localDB.addLocation(`Target Depot B ${uid}`, admin);

    prodId = prod.id;
    locA = lA.id;
    locB = lB.id;

    localDB.updateStock(prodId, locA, 100, null, admin);
    localDB.updateStock(prodId, locB, 20, null, admin);
  });

  it("successfully moves partial stock and strictly satisfies conservation invariant", () => {
    const getQty = (loc: string) =>
      localDB.getStock().find(s => s.product_id === prodId && s.storage_location_id === loc)?.quantity || 0;

    const totalBefore = getQty(locA) + getQty(locB);
    expect(totalBefore).toBe(120);

    const movementsBefore = localDB.getStockMovements().length;
    const success = localDB.moveStock(prodId, locA, locB, 35, null, admin);
    expect(success).toBe(true);

    const totalAfter = getQty(locA) + getQty(locB);
    expect(totalAfter).toBe(totalBefore); // Invariant check!
    expect(getQty(locA)).toBe(65);
    expect(getQty(locB)).toBe(55);

    // Verify movement logging
    const movements = localDB.getStockMovements();
    expect(movements.length).toBe(movementsBefore + 1);
    expect(movements[0].movement_type).toBe("transferred");
    expect(movements[0].quantity).toBe(35);
    expect(movements[0].from_location_name).toContain("Source Depot A");
    expect(movements[0].to_location_name).toContain("Target Depot B");
  });

  it("successfully moves 100% of source stock leaving source with 0", () => {
    localDB.moveStock(prodId, locA, locB, 100, null, admin);

    const stockA = localDB.getStock().find(s => s.product_id === prodId && s.storage_location_id === locA);
    const stockB = localDB.getStock().find(s => s.product_id === prodId && s.storage_location_id === locB);

    expect(stockA?.quantity).toBe(0);
    expect(stockB?.quantity).toBe(120);
  });

  it("rejects transfer when source and destination locations are identical", () => {
    expect(() => localDB.moveStock(prodId, locA, locA, 10, null, admin)).toThrowError(
      "Source and destination locations cannot be the same."
    );
  });

  it("rejects transfer with zero or negative quantity", () => {
    expect(() => localDB.moveStock(prodId, locA, locB, 0, null, admin)).toThrowError(
      "Quantity must be greater than zero."
    );
    expect(() => localDB.moveStock(prodId, locA, locB, -15, null, admin)).toThrowError(
      "Quantity must be greater than zero."
    );
  });

  it("rejects transfer when requested quantity exceeds available source stock", () => {
    expect(() => localDB.moveStock(prodId, locA, locB, 101, null, admin)).toThrowError(
      "Insufficient stock available at the source location."
    );
  });

  it("rejects transfer by operator lacking edit_inventory permissions", () => {
    const restricted = createRestrictedOperator();
    expect(() => localDB.moveStock(prodId, locA, locB, 10, null, restricted)).toThrowError(
      "Unauthorized: Your user account lacks permission to modify inventory."
    );
  });
});
