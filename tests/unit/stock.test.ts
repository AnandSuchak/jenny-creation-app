import { describe, it, expect, beforeEach } from "vitest";
import { localDB } from "@/lib/mockData";
import { createSuperAdminUser, createRestrictedOperator } from "../fixtures/factories";

describe("Stock Management & Inventory Ledger Tests", () => {
  const admin = createSuperAdminUser();
  let prodId: string;
  let locId: string;
  let loc2Id: string;

  beforeEach(() => {
    const uid = Math.random().toString(36).substring(2, 7);
    const cat = localDB.addCategory(`Storage Boxes ${uid}`, admin);
    const sub = localDB.addSubType(`2 Jar ${uid}`, cat.id, admin);
    const prod = localDB.addProduct(`Dryfruit Box Gold ${uid}`, cat.id, sub.id, [], 450, undefined, admin);
    const loc1 = localDB.addLocation(`Central Warehouse ${uid}`, admin);
    const loc2 = localDB.addLocation(`Retail Outlet Display ${uid}`, admin);

    prodId = prod.id;
    locId = loc1.id;
    loc2Id = loc2.id;
  });

  describe("Stock Upsert & Deltas", () => {
    it("creates new stock record when product has no existing stock in location", () => {
      const stock = localDB.updateStock(prodId, locId, 100, null, admin);
      expect(stock).toBeDefined();
      expect(stock.product_id).toBe(prodId);
      expect(stock.storage_location_id).toBe(locId);
      expect(stock.quantity).toBe(100);

      const activeStock = localDB.getStock();
      expect(activeStock.some(s => s.id === stock.id && s.quantity === 100)).toBe(true);
    });

    it("logs 'added' movement when stock quantity increases", () => {
      localDB.updateStock(prodId, locId, 50, null, admin);
      const movementsBefore = localDB.getStockMovements().length;

      localDB.updateStock(prodId, locId, 80, null, admin); // +30 increase
      const movements = localDB.getStockMovements();

      expect(movements.length).toBe(movementsBefore + 1);
      const latest = movements[0];
      expect(latest.movement_type).toBe("added");
      expect(latest.quantity).toBe(30);
      expect(latest.to_location_name).toContain("Central Warehouse");
    });

    it("logs 'removed' movement when stock quantity decreases", () => {
      localDB.updateStock(prodId, locId, 50, null, admin);
      const movementsBefore = localDB.getStockMovements().length;

      localDB.updateStock(prodId, locId, 20, null, admin); // -30 decrease
      const movements = localDB.getStockMovements();

      expect(movements.length).toBe(movementsBefore + 1);
      const latest = movements[0];
      expect(latest.movement_type).toBe("removed");
      expect(latest.quantity).toBe(30);
      expect(latest.from_location_name).toContain("Central Warehouse");
    });

    it("does not log movement when quantity is unchanged", () => {
      localDB.updateStock(prodId, locId, 50, null, admin);
      const movementsBefore = localDB.getStockMovements().length;

      localDB.updateStock(prodId, locId, 50, null, admin);
      const movementsAfter = localDB.getStockMovements().length;

      expect(movementsAfter).toBe(movementsBefore);
    });

    it("REGRESSION TEST (BUG-005): documents that negative quantity is accepted by updateStock", () => {
      // Documenting actual behavior: updateStock does not reject negative quantities
      const stock = localDB.updateStock(prodId, locId, -25, null, admin);
      expect(stock.quantity).toBe(-25);
    });
  });

  describe("Additives Stock Management", () => {
    it("creates additive and synchronizes initial quantity to first location stock", () => {
      const additive = localDB.addAdditive("Pistachio Premium", 1200, 15, admin);
      expect(additive).toBeDefined();
      expect(additive.price_per_kg).toBe(1200);
      expect(additive.stock_qty_kg).toBe(15);

      const stockRecords = localDB.getStock();
      const addStock = stockRecords.find(s => s.additive_id === additive.id);
      expect(addStock).toBeDefined();
      expect(addStock?.quantity).toBe(15);
    });

    it("rejects duplicate additive name", () => {
      localDB.addAdditive("Almonds California", 850, 20, admin);
      expect(() => localDB.addAdditive("almonds california", 850, 20, admin)).toThrowError(
        'Additive "almonds california" already exists.'
      );
    });

    it("updates additive price, stock quantity, and keeps location stock synced", () => {
      const add = localDB.addAdditive("Raisins Green", 400, 10, admin);
      const updated = localDB.updateAdditive(add.id, "Raisins Golden", 450, 18, admin);

      expect(updated?.name).toBe("Raisins Golden");
      expect(updated?.price_per_kg).toBe(450);
      expect(updated?.stock_qty_kg).toBe(18);

      const stockRecords = localDB.getStock();
      const addStock = stockRecords.find(s => s.additive_id === add.id);
      expect(addStock?.quantity).toBe(18);
    });
  });

  describe("Storage Locations CRUD", () => {
    it("creates storage location and rejects duplicates", () => {
      const loc = localDB.addLocation("Warehouse 5", admin);
      expect(loc.name).toBe("Warehouse 5");

      expect(() => localDB.addLocation("warehouse 5", admin)).toThrowError(
        'Storage location "warehouse 5" already exists.'
      );
    });
  });

  describe("RBAC Permissions", () => {
    it("rejects stock modification by restricted operator", () => {
      const restricted = createRestrictedOperator();
      expect(() => localDB.updateStock(prodId, locId, 10, null, restricted)).toThrowError(
        "Unauthorized: Your user account lacks permission to modify inventory."
      );
    });
  });
});
