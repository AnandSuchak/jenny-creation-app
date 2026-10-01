import { describe, it, expect, beforeEach } from "vitest";
import { localDB } from "@/lib/mockData";
import { createSuperAdminUser, createRestrictedOperator } from "../fixtures/factories";

describe("Product Service & Validation Tests", () => {
  const admin = createSuperAdminUser();
  let catId: string;
  let subId: string;

  beforeEach(() => {
    const uid = Math.random().toString(36).substring(2, 7);
    const cat = localDB.addCategory(`Boxes-${uid}`, admin);
    const sub = localDB.addSubType(`4 Jar-${uid}`, cat.id, admin);
    catId = cat.id;
    subId = sub.id;
  });

  describe("CREATE Operations", () => {
    it("creates a product with full details and valid fields", () => {
      const prod = localDB.addProduct(
        "Diamond Cut 4 Jar Box",
        catId,
        subId,
        ["https://example.com/p1.jpg", "https://example.com/p2.jpg"],
        650,
        "SUP-DIA-04",
        admin
      );

      expect(prod).toBeDefined();
      expect(prod.id).toMatch(/^prod-/);
      expect(prod.name).toBe("Diamond Cut 4 Jar Box");
      expect(prod.category_id).toBe(catId);
      expect(prod.sub_type_id).toBe(subId);
      expect(prod.price).toBe(650);
      expect(prod.supplier_code).toBe("SUP-DIA-04");
      expect(prod.photos).toHaveLength(2);
      expect(prod.deleted_at).toBeNull();

      const active = localDB.getProducts();
      expect(active.some(p => p.id === prod.id)).toBe(true);
    });

    it("applies default fallback photo if photos array is empty", () => {
      const prod = localDB.addProduct("Empty Photo Box", catId, subId, [], 300, undefined, admin);
      expect(prod.photos).toHaveLength(1);
      expect(prod.photos[0]).toContain("unsplash.com");
    });

    it("handles boundary price values: zero, decimals, large numbers", () => {
      const pZero = localDB.addProduct("Sample Free Box", catId, subId, [], 0, undefined, admin);
      expect(pZero.price).toBe(0);

      const pDecimal = localDB.addProduct("Precision Box", catId, subId, [], 499.75, undefined, admin);
      expect(pDecimal.price).toBe(499.75);

      const pLarge = localDB.addProduct("Ultra Luxury Hamper", catId, subId, [], 999999.99, undefined, admin);
      expect(pLarge.price).toBe(999999.99);
    });

    it("REGRESSION TEST (BUG-011): documents that product name uniqueness is not enforced", () => {
      const prod1 = localDB.addProduct("Standard Sweet Box", catId, subId, [], 200, undefined, admin);
      const prod2 = localDB.addProduct("Standard Sweet Box", catId, subId, [], 200, undefined, admin);

      expect(prod1.id).not.toBe(prod2.id);
      expect(prod1.name).toBe(prod2.name);
    });

    it("REGRESSION TEST (BUG-010): documents acceptance of invalid foreign key IDs", () => {
      const prod = localDB.addProduct("Orphan Box", "cat-nonexistent-999", "sub-nonexistent-888", [], 150, undefined, admin);
      expect(prod.category_id).toBe("cat-nonexistent-999");
      expect(prod.sub_type_id).toBe("sub-nonexistent-888");
    });
  });

  describe("UPDATE Operations", () => {
    it("updates product attributes completely", () => {
      const prod = localDB.addProduct("Original Name", catId, subId, ["/old.jpg"], 400, "OLD-01", admin);
      const updated = localDB.updateProduct(
        prod.id,
        "Updated Name",
        catId,
        subId,
        ["/new1.jpg", "/new2.jpg"],
        475,
        "NEW-02",
        admin
      );

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe("Updated Name");
      expect(updated?.price).toBe(475);
      expect(updated?.supplier_code).toBe("NEW-02");
      expect(updated?.photos).toEqual(["/new1.jpg", "/new2.jpg"]);
    });

    it("returns null when updating non-existent product ID", () => {
      const result = localDB.updateProduct("prod-fake-404", "Ghost", catId, subId, [], 100, undefined, admin);
      expect(result).toBeNull();
    });
  });

  describe("SOFT DELETE & RESTORE Operations", () => {
    it("soft deletes and restores product cleanly", () => {
      const prod = localDB.addProduct("Archivable Box", catId, subId, [], 350, undefined, admin);
      expect(localDB.getProducts().some(p => p.id === prod.id)).toBe(true);

      localDB.softDelete("products", prod.id);
      expect(localDB.getProducts().some(p => p.id === prod.id)).toBe(false);
      expect(localDB.getDeletedProducts().some(p => p.id === prod.id)).toBe(true);

      localDB.restore("products", prod.id);
      expect(localDB.getProducts().some(p => p.id === prod.id)).toBe(true);
      expect(localDB.getDeletedProducts().some(p => p.id === prod.id)).toBe(false);
    });
  });

  describe("Self-Healing Deduplication Engine", () => {
    it("automatically cleans corrupted duplicate product IDs in localStorage upon getProducts()", () => {
      const rawProducts = [
        { id: "prod-duplicate-1", name: "Box One", category_id: catId, sub_type_id: subId, photos: [], price: 100, deleted_at: null },
        { id: "prod-duplicate-1", name: "Box Two", category_id: catId, sub_type_id: subId, photos: [], price: 200, deleted_at: null }
      ];
      localStorage.setItem("jenny_creation_products", JSON.stringify(rawProducts));

      const cleaned = localDB.getProducts();
      expect(cleaned).toHaveLength(2);
      expect(cleaned[0].id).not.toBe(cleaned[1].id);
    });
  });

  describe("RBAC Permissions", () => {
    it("rejects product creation by unauthorized operator", () => {
      const restricted = createRestrictedOperator();
      expect(() => localDB.addProduct("Hacked Box", catId, subId, [], 100, undefined, restricted)).toThrowError(
        "Unauthorized: Your user account lacks permission to modify inventory."
      );
    });
  });
});
