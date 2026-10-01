import { describe, it, expect, beforeEach } from "vitest";
import { localDB } from "@/lib/mockData";
import { createSuperAdminUser, createRestrictedOperator } from "../fixtures/factories";

describe("Category Service & Validation Tests", () => {
  const admin = createSuperAdminUser();

  beforeEach(() => {
    localStorage.clear();
  });

  describe("CREATE Operations", () => {
    it("creates a valid category and trims leading/trailing whitespace", () => {
      const initialCount = localDB.getCategories().length;
      const cat = localDB.addCategory("  Luxury Gift Box  ", admin);
      expect(cat).toBeDefined();
      expect(cat.id).toMatch(/^cat-/);
      expect(cat.name).toBe("Luxury Gift Box");
      expect(cat.deleted_at).toBeNull();

      const active = localDB.getCategories();
      expect(active).toHaveLength(initialCount + 1);
      const found = active.find(c => c.id === cat.id);
      expect(found).toBeDefined();
      expect(found?.name).toBe("Luxury Gift Box");
    });

    it("handles boundary characters: single character, special chars, unicode & emoji", () => {
      const c1 = localDB.addCategory("X", admin);
      expect(c1.name).toBe("X");

      const c2 = localDB.addCategory("Box & Tray / 2026-Edition #1", admin);
      expect(c2.name).toBe("Box & Tray / 2026-Edition #1");

      const c3 = localDB.addCategory("🎁 Diwali Special કાજુ બોક્સ", admin);
      expect(c3.name).toBe("🎁 Diwali Special કાજુ બોક્સ");
    });

    it("rejects exact duplicate category names", () => {
      localDB.addCategory("Mithai Box", admin);
      expect(() => localDB.addCategory("Mithai Box", admin)).toThrowError(
        'Category "Mithai Box" already exists.'
      );
    });

    it("rejects duplicate category names with different casing", () => {
      localDB.addCategory("Dryfruit Pack", admin);
      expect(() => localDB.addCategory("dryfruit pack", admin)).toThrowError(
        'Category "dryfruit pack" already exists.'
      );
    });

    it("rejects duplicate category names with extra leading/trailing whitespace", () => {
      localDB.addCategory("Tin Canister", admin);
      expect(() => localDB.addCategory("   Tin Canister   ", admin)).toThrowError(
        'Category "Tin Canister" already exists.'
      );
    });

    it("permits creating category with same name if previous one was soft-deleted", () => {
      const cat1 = localDB.addCategory("Seasonal Box", admin);
      localDB.softDelete("categories", cat1.id);

      expect(localDB.getCategories().some(c => c.id === cat1.id)).toBe(false);

      const cat2 = localDB.addCategory("Seasonal Box", admin);
      expect(cat2.id).not.toBe(cat1.id);
      expect(cat2.name).toBe("Seasonal Box");
    });
  });

  describe("UPDATE Operations", () => {
    it("updates existing category name cleanly and updates timestamp", () => {
      const cat = localDB.addCategory("Old Category Name", admin);
      const updated = localDB.updateCategory(cat.id, "New Category Name", admin);

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe("New Category Name");
      expect(new Date(updated!.updated_at).getTime()).toBeGreaterThanOrEqual(new Date(cat.created_at).getTime());

      const list = localDB.getCategories();
      expect(list.find(c => c.id === cat.id)?.name).toBe("New Category Name");
    });

    it("rejects updating a category name to another existing category name", () => {
      localDB.addCategory("Category Alpha", admin);
      const catB = localDB.addCategory("Category Beta", admin);

      expect(() => localDB.updateCategory(catB.id, "Category Alpha", admin)).toThrowError(
        'Category "Category Alpha" already exists.'
      );
    });

    it("returns null when updating a non-existent category ID", () => {
      const result = localDB.updateCategory("non-existent-cat-999", "Random Name", admin);
      expect(result).toBeNull();
    });
  });

  describe("SOFT DELETE & RESTORE Operations", () => {
    it("soft deletes category: removed from active, present in deleted", () => {
      const cat = localDB.addCategory("Disposable Tray", admin);
      expect(localDB.getCategories().some(c => c.id === cat.id)).toBe(true);

      const deleted = localDB.softDelete("categories", cat.id);
      expect(deleted).toBe(true);

      expect(localDB.getCategories().some(c => c.id === cat.id)).toBe(false);
      const deletedList = localDB.getDeletedCategories();
      expect(deletedList.some(c => c.id === cat.id)).toBe(true);
      const deletedItem = deletedList.find(c => c.id === cat.id);
      expect(deletedItem?.deleted_at).not.toBeNull();
    });

    it("restores soft-deleted category cleanly", () => {
      const cat = localDB.addCategory("Reusable Hamper", admin);
      localDB.softDelete("categories", cat.id);
      expect(localDB.getCategories().some(c => c.id === cat.id)).toBe(false);

      const restored = localDB.restore("categories", cat.id);
      expect(restored).toBe(true);

      const active = localDB.getCategories();
      expect(active.some(c => c.id === cat.id)).toBe(true);
      const restoredItem = active.find(c => c.id === cat.id);
      expect(restoredItem?.deleted_at).toBeNull();
    });

    it("REGRESSION TEST (BUG-008): verifies return value when soft-deleting non-existent ID", () => {
      const result = localDB.softDelete("categories", "completely-fake-id-404");
      expect(typeof result).toBe("boolean");
    });
  });

  describe("RBAC Permissions", () => {
    it("rejects category creation by operator without edit_inventory right", () => {
      const restricted = createRestrictedOperator();
      expect(() => localDB.addCategory("Unauthorized Box", restricted)).toThrowError(
        "Unauthorized: Your user account lacks permission to modify inventory."
      );
    });

    it("rejects category update by operator without edit_inventory right", () => {
      const cat = localDB.addCategory("Admin Box", admin);
      const restricted = createRestrictedOperator();
      expect(() => localDB.updateCategory(cat.id, "Hacked Box", restricted)).toThrowError(
        "Unauthorized: Your user account lacks permission to modify inventory."
      );
    });
  });
});
