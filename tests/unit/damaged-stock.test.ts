import { describe, it, expect, beforeEach } from "vitest";
import { localDB } from "@/lib/mockData";
import { createSuperAdminUser, createRestrictedOperator } from "../fixtures/factories";

describe("Damaged Stock & Waste Management Tests", () => {
  const admin = createSuperAdminUser();
  let prodId: string;
  let locId: string;

  beforeEach(() => {
    const uid = Math.random().toString(36).substring(2, 7);
    const cat = localDB.addCategory(`Damage Cat ${uid}`, admin);
    const sub = localDB.addSubType(`1 Box ${uid}`, cat.id, admin);
    const prod = localDB.addProduct(`Fragile Glass Jar Box ${uid}`, cat.id, sub.id, [], 350, undefined, admin);
    const loc = localDB.addLocation(`Damage QA Floor ${uid}`, admin);

    prodId = prod.id;
    locId = loc.id;
    localDB.updateStock(prodId, locId, 50, null, admin);
  });

  it("marks product stock damaged: decreases physical stock and records damage entry", () => {
    const movementsBefore = localDB.getStockMovements().length;
    const damaged = localDB.addDamagedStock(prodId, locId, 12, null, admin);

    expect(damaged).toBeDefined();
    expect(damaged.product_id).toBe(prodId);
    expect(damaged.quantity).toBe(12);

    // Verify physical stock decreased by exactly 12
    const currentStock = localDB.getStock().find(s => s.product_id === prodId && s.storage_location_id === locId);
    expect(currentStock?.quantity).toBe(38);

    // Verify damaged_stock list
    const dmgList = localDB.getDamagedStock();
    expect(dmgList.some(d => d.id === damaged.id)).toBe(true);

    // Verify audit log
    const movements = localDB.getStockMovements();
    expect(movements.length).toBe(movementsBefore + 1);
    expect(movements[0].movement_type).toBe("damaged");
    expect(movements[0].quantity).toBe(12);
  });

  it("marks exact available stock as damaged leaving zero available", () => {
    localDB.addDamagedStock(prodId, locId, 50, null, admin);
    const stock = localDB.getStock().find(s => s.product_id === prodId && s.storage_location_id === locId);
    expect(stock?.quantity).toBe(0);
  });

  it("rejects damage quantity greater than available stock", () => {
    expect(() => localDB.addDamagedStock(prodId, locId, 51, null, admin)).toThrowError(
      "Insufficient stock to mark as damaged. Requested: 51, Available: 50"
    );
  });

  it("REGRESSION TEST (BUG-006): documents vulnerability where negative damage quantity increases stock", () => {
    // Current implementation does not check quantity <= 0.
    // stocks[stIndex].quantity -= (-10) results in stock increasing from 50 to 60!
    localDB.addDamagedStock(prodId, locId, -10, null, admin);
    const stock = localDB.getStock().find(s => s.product_id === prodId && s.storage_location_id === locId);
    expect(stock?.quantity).toBe(60);
  });

  it("rejects marking damaged stock by operator lacking edit_inventory right", () => {
    const restricted = createRestrictedOperator();
    expect(() => localDB.addDamagedStock(prodId, locId, 5, null, restricted)).toThrowError(
      "Unauthorized: Your user account lacks permission to modify inventory."
    );
  });
});
