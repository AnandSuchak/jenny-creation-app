import { describe, it, expect, beforeEach } from "vitest";
import { localDB } from "@/lib/mockData";
import { createSuperAdminUser } from "../fixtures/factories";

describe("Integration: Complete Business Lifecycle End-to-End Workflow", () => {
  const admin = createSuperAdminUser();

  beforeEach(() => {
    localStorage.clear();
  });

  it("executes the entire business lifecycle from setup to billing, movements, and backup restoration", () => {
    // 1. Setup Master Catalog Data
    const category = localDB.addCategory("Festive Collection 2026", admin);
    const subType = localDB.addSubType("4 Jar Hexagonal", category.id, admin);
    const locNorth = localDB.addLocation("North Hub Warehouse", admin);
    const locRetail = localDB.addLocation("Downtown Boutique Display", admin);
    const almonds = localDB.addAdditive("Afghan Mamra Badam", 1800, 30, admin); // 30 kg

    expect(category.id).toBeDefined();
    expect(subType.id).toBeDefined();

    // 2. Product Catalog Registration
    const product = localDB.addProduct(
      "Royal Sovereign 4-Jar Hamper",
      category.id,
      subType.id,
      ["/royal_hamper.jpg"],
      1200,
      "SUP-ROYAL-04",
      admin
    );
    expect(product.id).toBeDefined();

    // 3. Initial Inventory Ingestion
    localDB.updateStock(product.id, locNorth.id, 100, null, admin);
    localDB.updateStock(null, locNorth.id, 30, almonds.id, admin);

    const initialStockNorth = localDB.getStock().find(s => s.product_id === product.id && s.storage_location_id === locNorth.id);
    expect(initialStockNorth?.quantity).toBe(100);

    // 4. Warehouse Transfer to Retail
    const transferSuccess = localDB.moveStock(product.id, locNorth.id, locRetail.id, 40, null, admin);
    expect(transferSuccess).toBe(true);

    const stockNorthAfterTransfer = localDB.getStock().find(s => s.product_id === product.id && s.storage_location_id === locNorth.id);
    const stockRetailAfterTransfer = localDB.getStock().find(s => s.product_id === product.id && s.storage_location_id === locRetail.id);
    expect(stockNorthAfterTransfer?.quantity).toBe(60);
    expect(stockRetailAfterTransfer?.quantity).toBe(40);

    // 5. Billing & Jar Customization
    // 10 boxes sold, each box has 1 jar of 250g almonds
    // Total almonds needed = 10 * 0.25 = 2.5 kg
    const customizations = [{ jar_number: 1, additive_id: almonds.id, weight_grams: 250 }];
    const items = [{ productId: product.id, quantity: 10, unitPrice: 1200, discount: 5, customizations }];

    const invoice = localDB.createInvoice(
      "Corporate Client Inc",
      "9988776655",
      items,
      "ordered",
      undefined,
      5000,
      "UPI",
      null,
      admin
    );

    // 10 * 1200 * 0.95 = 11400
    expect(invoice.total_amount).toBe(11400);

    // Stock deduction checks:
    // First active warehouse with stock depleted 10 units (North had 60 -> becomes 50)
    const stockNorthAfterSale = localDB.getStock().find(s => s.product_id === product.id && s.storage_location_id === locNorth.id);
    expect(stockNorthAfterSale?.quantity).toBe(50);

    // Almonds in North hub depleted 2.5 kg: 30 - 2.5 = 27.5 kg
    const almondStockAfterSale = localDB.getStock().find(s => s.additive_id === almonds.id && s.storage_location_id === locNorth.id);
    expect(almondStockAfterSale?.quantity).toBe(27.5);

    // 6. Invoice Status Updates
    localDB.updateInvoiceStatus(invoice.id, "preparing");
    localDB.updateInvoiceStatus(invoice.id, "completed");
    const delivered = localDB.updateInvoiceStatus(invoice.id, "delivered");
    expect(delivered?.status).toBe("delivered");

    // 7. Damaged Stock Marking
    localDB.addDamagedStock(product.id, locRetail.id, 2, null, admin);
    const stockRetailAfterDamage = localDB.getStock().find(s => s.product_id === product.id && s.storage_location_id === locRetail.id);
    expect(stockRetailAfterDamage?.quantity).toBe(38); // 40 - 2

    // 8. Backup Snapshot Creation & Restore
    const snapshot = localDB.createBackupSnapshot();
    expect(snapshot).not.toBeNull();
    expect(snapshot.data.invoices).toHaveLength(1);

    // Simulate accidental soft deletion of product
    localDB.softDelete("products", product.id);
    expect(localDB.getProducts().some(p => p.id === product.id)).toBe(false);

    // Restore from backup snapshot
    const restoreSuccess = localDB.restoreBackupSnapshot(snapshot.id);
    expect(restoreSuccess).toBe(true);

    expect(localDB.getProducts().some(p => p.id === product.id)).toBe(true);
  });
});
