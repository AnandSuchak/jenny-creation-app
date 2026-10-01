import { describe, it, expect } from "vitest";
import { localDB } from "@/lib/mockData";
import { createSuperAdminUser } from "../fixtures/factories";

describe("Core Business Property & Invariant Automated Tests", () => {
  const admin = createSuperAdminUser();

  it("Invariant 1: Stock Conservation across transfers", () => {
    const uid = Math.random().toString(36).substring(2, 7);
    const cat = localDB.addCategory(`Inv Cat ${uid}`, admin);
    const sub = localDB.addSubType(`Inv Sub ${uid}`, cat.id, admin);
    const prod = localDB.addProduct(`Conservation Box ${uid}`, cat.id, sub.id, [], 100, undefined, admin);
    const loc1 = localDB.addLocation(`Warehouse 1 ${uid}`, admin);
    const loc2 = localDB.addLocation(`Warehouse 2 ${uid}`, admin);

    localDB.updateStock(prod.id, loc1.id, 80, null, admin);
    localDB.updateStock(prod.id, loc2.id, 40, null, admin);

    const getSum = () =>
      localDB.getStock()
        .filter(s => s.product_id === prod.id)
        .reduce((sum, s) => sum + s.quantity, 0);

    const sumBefore = getSum();
    expect(sumBefore).toBe(120);

    // Perform multiple random transfers
    localDB.moveStock(prod.id, loc1.id, loc2.id, 25, null, admin);
    expect(getSum()).toBe(sumBefore);

    localDB.moveStock(prod.id, loc2.id, loc1.id, 10, null, admin);
    expect(getSum()).toBe(sumBefore);

    localDB.moveStock(prod.id, loc1.id, loc2.id, 5, null, admin);
    expect(getSum()).toBe(sumBefore);
  });

  it("Invariant 2: Invoice Line & Aggregate Mathematical Agreement", () => {
    const uid = Math.random().toString(36).substring(2, 7);
    const cat = localDB.addCategory(`Math Cat ${uid}`, admin);
    const sub = localDB.addSubType(`Math Sub ${uid}`, cat.id, admin);
    const p1 = localDB.addProduct(`Math Box 1 ${uid}`, cat.id, sub.id, [], 333.33, undefined, admin);
    const p2 = localDB.addProduct(`Math Box 2 ${uid}`, cat.id, sub.id, [], 444.44, undefined, admin);
    const loc = localDB.addLocation(`Math Loc ${uid}`, admin);

    localDB.updateStock(p1.id, loc.id, 100, null, admin);
    localDB.updateStock(p2.id, loc.id, 100, null, admin);

    const items = [
      { productId: p1.id, quantity: 3, unitPrice: 333.33, discount: 7.5 },
      { productId: p2.id, quantity: 5, unitPrice: 444.44, discount: 15.0 }
    ];

    const invoice = localDB.createInvoice("Math Client", "9876543210", items, "ordered", undefined, 0, "Cash", null, admin);

    let calculatedTotal = 0;
    for (const item of invoice.items!) {
      const expectedLineTotal = item.quantity * item.unit_price * (1 - (item.discount || 0) / 100);
      expect(item.total_price).toBeCloseTo(expectedLineTotal, 5);
      calculatedTotal += item.total_price;
    }

    expect(invoice.total_amount).toBeCloseTo(calculatedTotal, 5);
  });

  it("Invariant 3: Soft-deleted entities never appear in active lists and always in deleted lists", () => {
    const uid = Math.random().toString(36).substring(2, 7);
    const cat = localDB.addCategory(`Invisible Cat ${uid}`, admin);
    expect(localDB.getCategories().some(c => c.id === cat.id)).toBe(true);

    localDB.softDelete("categories", cat.id);
    expect(localDB.getCategories().some(c => c.id === cat.id)).toBe(false);
    expect(localDB.getDeletedCategories().some(c => c.id === cat.id)).toBe(true);
  });

  it("Invariant 4: Movement audit trail created for every stock alteration", () => {
    const uid = Math.random().toString(36).substring(2, 7);
    const cat = localDB.addCategory(`Audit Cat ${uid}`, admin);
    const sub = localDB.addSubType(`Audit Sub ${uid}`, cat.id, admin);
    const prod = localDB.addProduct(`Audit Box ${uid}`, cat.id, sub.id, [], 100, undefined, admin);
    const loc1 = localDB.addLocation(`Audit Loc 1 ${uid}`, admin);
    const loc2 = localDB.addLocation(`Audit Loc 2 ${uid}`, admin);

    const count0 = localDB.getStockMovements().length;

    // Operation 1: Added
    localDB.updateStock(prod.id, loc1.id, 50, null, admin);
    expect(localDB.getStockMovements()).toHaveLength(count0 + 1);
    expect(localDB.getStockMovements()[0].movement_type).toBe("added");

    // Operation 2: Transferred
    localDB.moveStock(prod.id, loc1.id, loc2.id, 20, null, admin);
    expect(localDB.getStockMovements()).toHaveLength(count0 + 2);
    expect(localDB.getStockMovements()[0].movement_type).toBe("transferred");

    // Operation 3: Damaged
    localDB.addDamagedStock(prod.id, loc2.id, 5, null, admin);
    expect(localDB.getStockMovements()).toHaveLength(count0 + 3);
    expect(localDB.getStockMovements()[0].movement_type).toBe("damaged");

    // Operation 4: Removed
    localDB.updateStock(prod.id, loc1.id, 10, null, admin);
    expect(localDB.getStockMovements()).toHaveLength(count0 + 4);
    expect(localDB.getStockMovements()[0].movement_type).toBe("removed");
  });

  it("Invariant 5: Primary Super Admin Account is immutable and indestructible", () => {
    expect(() => localDB.deleteUser("usr-admin", "other-user")).toThrowError();
    expect(() => localDB.updateUserRights("usr-admin", { view_stock: false, generate_bill: false, edit_inventory: false }, "other-admin")).toThrowError();
    expect(() => localDB.resetUserPassword("usr-admin", "hash", "other-admin")).toThrowError();
  });
});
