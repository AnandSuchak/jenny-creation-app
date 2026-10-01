import { describe, it, expect, beforeEach } from "vitest";
import { localDB } from "@/lib/mockData";
import { createSuperAdminUser, createRestrictedOperator } from "../fixtures/factories";

describe("Invoice Update Lifecycle & Stock Reversion Tests", () => {
  const admin = createSuperAdminUser();
  let prodId: string;
  let locId: string;

  beforeEach(() => {
    const uid = Math.random().toString(36).substring(2, 7);
    const cat = localDB.addCategory(`Update Category ${uid}`, admin);
    const sub = localDB.addSubType(`1 Jar ${uid}`, cat.id, admin);
    const p = localDB.addProduct(`Modifiable Gift Box ${uid}`, cat.id, sub.id, [], 500, undefined, admin);
    const loc = localDB.addLocation(`Central Hub ${uid}`, admin);

    prodId = p.id;
    locId = loc.id;
    localDB.updateStock(prodId, locId, 50, null, admin);
  });

  it("restores old stock and re-deducts when decreasing quantity (net positive return to inventory)", () => {
    // Initial invoice: 5 units. Stock was 50 -> becomes 45.
    const initialItems = [{ productId: prodId, quantity: 5, unitPrice: 500, discount: 0 }];
    const inv = localDB.createInvoice("Customer Delta", "9876543210", initialItems, "ordered", undefined, 0, "Cash", null, admin);

    let currentStock = localDB.getStock().find(s => s.product_id === prodId && s.storage_location_id === locId);
    expect(currentStock?.quantity).toBe(45);

    // Update invoice: reduce to 3 units. Net stock effect: restore 5 (50), deduct 3 (47).
    const updatedItems = [{ productId: prodId, quantity: 3, unitPrice: 500, discount: 0 }];
    const updatedInv = localDB.updateInvoice(inv.id, "Customer Delta", "9876543210", updatedItems, "ordered", undefined, 0, "Cash", null, admin);

    expect(updatedInv).not.toBeNull();
    expect(updatedInv?.total_amount).toBe(1500);

    currentStock = localDB.getStock().find(s => s.product_id === prodId && s.storage_location_id === locId);
    expect(currentStock?.quantity).toBe(47);
  });

  it("restores old stock and re-deducts when increasing quantity (net deduction)", () => {
    // Initial invoice: 5 units. Stock 50 -> 45.
    const initialItems = [{ productId: prodId, quantity: 5, unitPrice: 500, discount: 0 }];
    const inv = localDB.createInvoice("Customer Inc", "9876543210", initialItems, "ordered", undefined, 0, "Cash", null, admin);

    // Update to 10 units. Net stock: restore 5 (50), deduct 10 (40).
    const updatedItems = [{ productId: prodId, quantity: 10, unitPrice: 500, discount: 0 }];
    localDB.updateInvoice(inv.id, "Customer Inc", "9876543210", updatedItems, "ordered", undefined, 0, "Cash", null, admin);

    const currentStock = localDB.getStock().find(s => s.product_id === prodId && s.storage_location_id === locId);
    expect(currentStock?.quantity).toBe(40);
  });

  it("updates invoice status through all lifecycle stages cleanly", () => {
    const items = [{ productId: prodId, quantity: 1, unitPrice: 500, discount: 0 }];
    const inv = localDB.createInvoice("Status Customer", "9876543210", items, "ordered", undefined, 0, "Cash", null, admin);

    expect(inv.status).toBe("ordered");

    const s1 = localDB.updateInvoiceStatus(inv.id, "preparing");
    expect(s1?.status).toBe("preparing");

    const s2 = localDB.updateInvoiceStatus(inv.id, "completed");
    expect(s2?.status).toBe("completed");

    const s3 = localDB.updateInvoiceStatus(inv.id, "delivered");
    expect(s3?.status).toBe("delivered");
  });

  it("rejects invoice update by unauthorized operator", () => {
    const items = [{ productId: prodId, quantity: 1, unitPrice: 500, discount: 0 }];
    const inv = localDB.createInvoice("Perm Customer", "9876543210", items, "ordered", undefined, 0, "Cash", null, admin);

    const restricted = createRestrictedOperator();
    expect(() =>
      localDB.updateInvoice(inv.id, "Perm Customer", "9876543210", items, "ordered", undefined, 0, "Cash", null, restricted)
    ).toThrowError("Unauthorized: Your user account lacks permission to update bills.");
  });
});
