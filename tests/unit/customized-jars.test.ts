import { describe, it, expect, beforeEach } from "vitest";
import { localDB } from "@/lib/mockData";
import { createSuperAdminUser } from "../fixtures/factories";

describe("Customized Jar Additives & Grams-to-Kg Conversion Tests", () => {
  const admin = createSuperAdminUser();
  let prodId: string;
  let locId: string;
  let kajuId: string;
  let badamId: string;

  beforeEach(() => {
    const uid = Math.random().toString(36).substring(2, 7);
    const cat = localDB.addCategory(`Jar Box Category ${uid}`, admin);
    const sub = localDB.addSubType(`2 Jar Velvet ${uid}`, cat.id, admin);
    const p = localDB.addProduct(`Velvet 2-Jar Box ${uid}`, cat.id, sub.id, [], 600, undefined, admin);
    const loc = localDB.addLocation(`Dryfruit Warehouse ${uid}`, admin);
    const kaju = localDB.addAdditive(`Premium Cashews ${uid}`, 1000, 10, admin); // 10 kg
    const badam = localDB.addAdditive(`California Almonds ${uid}`, 900, 10, admin); // 10 kg

    prodId = p.id;
    locId = loc.id;
    kajuId = kaju.id;
    badamId = badam.id;

    localDB.updateStock(prodId, locId, 50, null, admin);
    localDB.updateStock(null, locId, 10, kajuId, admin);
    localDB.updateStock(null, locId, 10, badamId, admin);
  });

  it("calculates exact dryfruit deduction: weight_kg = (grams * box_quantity) / 1000", () => {
    // 4 boxes, each containing 250g Kaju and 250g Badam
    // Expected deduction: Kaju = 4 * 0.25 = 1.0 kg; Badam = 4 * 0.25 = 1.0 kg
    const customizations = [
      { jar_number: 1, additive_id: kajuId, weight_grams: 250 },
      { jar_number: 2, additive_id: badamId, weight_grams: 250 }
    ];

    const items = [
      {
        productId: prodId,
        quantity: 4,
        unitPrice: 600,
        discount: 0,
        customizations
      }
    ];

    localDB.createInvoice("Wedding Client", "9876543210", items, "ordered", undefined, 0, "Cash", null, admin);

    const kajuStock = localDB.getStock().find(s => s.additive_id === kajuId && s.storage_location_id === locId);
    const badamStock = localDB.getStock().find(s => s.additive_id === badamId && s.storage_location_id === locId);

    expect(kajuStock?.quantity).toBe(9.0); // 10.0 - 1.0
    expect(badamStock?.quantity).toBe(9.0); // 10.0 - 1.0
  });

  it("ignores empty jars ('empty') and zero-gram jar configurations", () => {
    const customizations = [
      { jar_number: 1, additive_id: "empty", weight_grams: 0 },
      { jar_number: 2, additive_id: kajuId, weight_grams: 0 }
    ];

    const items = [
      {
        productId: prodId,
        quantity: 2,
        unitPrice: 600,
        discount: 0,
        customizations
      }
    ];

    localDB.createInvoice("Empty Jar Client", "9876543210", items, "ordered", undefined, 0, "Cash", null, admin);

    const kajuStock = localDB.getStock().find(s => s.additive_id === kajuId && s.storage_location_id === locId);
    expect(kajuStock?.quantity).toBe(10); // Untouched
  });

  it("rejects invoice when requested customized dryfruit exceeds available stock", () => {
    // 50 boxes * 500g Kaju = 25 kg Kaju needed. Only 10 kg available.
    const customizations = [
      { jar_number: 1, additive_id: kajuId, weight_grams: 500 }
    ];

    const items = [
      {
        productId: prodId,
        quantity: 50,
        unitPrice: 600,
        discount: 0,
        customizations
      }
    ];

    expect(() =>
      localDB.createInvoice("Heavy Buyer", "9876543210", items, "ordered", undefined, 0, "Cash", null, admin)
    ).toThrowError(/Insufficient stock of dryfruit ingredient "Premium Cashews/);
  });
});
