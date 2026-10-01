import { describe, it, expect, beforeEach } from "vitest";
import { localDB } from "@/lib/mockData";
import { createSuperAdminUser } from "../fixtures/factories";

describe("Invoice Mathematical Invariants & Billing Calculations", () => {
  const admin = createSuperAdminUser();
  let prod1Id: string;
  let prod2Id: string;
  let locId: string;

  beforeEach(() => {
    const uid = Math.random().toString(36).substring(2, 7);
    const cat = localDB.addCategory(`Billing Category ${uid}`, admin);
    const sub = localDB.addSubType(`2 Jar ${uid}`, cat.id, admin);
    const p1 = localDB.addProduct(`Product 1 ${uid}`, cat.id, sub.id, [], 500, undefined, admin);
    const p2 = localDB.addProduct(`Product 2 ${uid}`, cat.id, sub.id, [], 750, undefined, admin);
    const loc = localDB.addLocation(`Store Location ${uid}`, admin);

    prod1Id = p1.id;
    prod2Id = p2.id;
    locId = loc.id;

    localDB.updateStock(prod1Id, locId, 100, null, admin);
    localDB.updateStock(prod2Id, locId, 100, null, admin);
  });

  it("calculates exact invoice line total and total amount without discounts", () => {
    const items = [
      { productId: prod1Id, quantity: 4, unitPrice: 500, discount: 0 },
      { productId: prod2Id, quantity: 2, unitPrice: 750, discount: 0 }
    ];

    const invoice = localDB.createInvoice("Rajesh Sharma", "9876543210", items, "ordered", undefined, 0, "Cash", null, admin);

    // Invariant: line 1 = 4 * 500 = 2000
    // line 2 = 2 * 750 = 1500
    // total = 3500
    expect(invoice.total_amount).toBe(3500);
    expect(invoice.items?.[0].total_price).toBe(2000);
    expect(invoice.items?.[1].total_price).toBe(1500);
  });

  it("calculates discounts accurately according to mathematical formula", () => {
    const items = [
      { productId: prod1Id, quantity: 10, unitPrice: 500, discount: 10 }, // 10 * 500 * 0.9 = 4500
      { productId: prod2Id, quantity: 4, unitPrice: 750, discount: 50 }   // 4 * 750 * 0.5 = 1500
    ];

    const invoice = localDB.createInvoice("Pooja Patel", "9898989898", items, "ordered", undefined, 1000, "UPI", null, admin);

    expect(invoice.total_amount).toBe(6000);
    expect(invoice.items?.[0].total_price).toBe(4500);
    expect(invoice.items?.[1].total_price).toBe(1500);
    expect(invoice.advance_paid).toBe(1000);
    expect(invoice.payment_mode).toBe("UPI");
  });

  it("handles 100% discount cleanly resulting in 0 total line price", () => {
    const items = [
      { productId: prod1Id, quantity: 2, unitPrice: 500, discount: 100 }
    ];

    const invoice = localDB.createInvoice("Complimentary VIP", "9000000000", items, "completed", undefined, 0, "Complimentary", null, admin);

    expect(invoice.total_amount).toBe(0);
    expect(invoice.items?.[0].total_price).toBe(0);
  });

  it("verifies invoice mathematical invariant: total_amount === sum(item.total_price)", () => {
    const items = [
      { productId: prod1Id, quantity: 3, unitPrice: 499.50, discount: 12.5 },
      { productId: prod2Id, quantity: 7, unitPrice: 725.25, discount: 5 }
    ];

    const invoice = localDB.createInvoice("Precision Customer", "9111111111", items, "ordered", undefined, 500, "Card", null, admin);

    const calculatedSum = invoice.items!.reduce((sum, item) => sum + item.total_price, 0);
    expect(invoice.total_amount).toBeCloseTo(calculatedSum, 5);
  });
});
