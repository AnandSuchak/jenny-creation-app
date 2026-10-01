import { describe, it, expect, beforeEach } from "vitest";
import { localDB } from "@/lib/mockData";
import { createSuperAdminUser, createRestrictedOperator } from "../fixtures/factories";

describe("Sub-Type Service & Relational Tests", () => {
  const admin = createSuperAdminUser();
  let catAId: string;
  let catBId: string;

  beforeEach(() => {
    const uid = Math.random().toString(36).substring(2, 8);
    const catA = localDB.addCategory(`Category A ${uid}`, admin);
    const catB = localDB.addCategory(`Category B ${uid}`, admin);
    catAId = catA.id;
    catBId = catB.id;
  });

  describe("Category-Scoped Uniqueness", () => {
    it("allows the identical subtype name under DIFFERENT categories", () => {
      const subA = localDB.addSubType("Peacock Pattern", catAId, admin);
      const subB = localDB.addSubType("Peacock Pattern", catBId, admin);

      expect(subA.id).not.toBe(subB.id);
      expect(subA.name).toBe("Peacock Pattern");
      expect(subB.name).toBe("Peacock Pattern");
      expect(subA.category_id).toBe(catAId);
      expect(subB.category_id).toBe(catBId);
    });

    it("rejects duplicate subtype name under the SAME category", () => {
      localDB.addSubType("Velvet Insert", catAId, admin);
      expect(() => localDB.addSubType("Velvet Insert", catAId, admin)).toThrowError(
        'Sub-Type "Velvet Insert" already exists under this category.'
      );
    });

    it("rejects duplicate subtype name with different casing under same category", () => {
      localDB.addSubType("Hexagonal 4 Jar", catAId, admin);
      expect(() => localDB.addSubType("hexagonal 4 jar", catAId, admin)).toThrowError(
        'Sub-Type "hexagonal 4 jar" already exists under this category.'
      );
    });

    it("rejects duplicate subtype name with trailing/leading spaces under same category", () => {
      localDB.addSubType("Drawer Box", catAId, admin);
      expect(() => localDB.addSubType("   Drawer Box   ", catAId, admin)).toThrowError(
        'Sub-Type "Drawer Box" already exists under this category.'
      );
    });
  });

  describe("UPDATE Operations & Category Transfer", () => {
    it("updates subtype name cleanly", () => {
      const sub = localDB.addSubType("Old Subtype", catAId, admin);
      const updated = localDB.updateSubType(sub.id, "Renamed Subtype", catAId, admin);

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe("Renamed Subtype");
      expect(localDB.getSubTypes().find(s => s.id === sub.id)?.name).toBe("Renamed Subtype");
    });

    it("allows moving subtype to another category if name is unique there", () => {
      const sub = localDB.addSubType("Universal Lid", catAId, admin);
      const moved = localDB.updateSubType(sub.id, "Universal Lid", catBId, admin);

      expect(moved).not.toBeNull();
      expect(moved?.category_id).toBe(catBId);
      expect(localDB.getSubTypes().find(s => s.id === sub.id)?.category_id).toBe(catBId);
    });

    it("rejects moving subtype to another category if duplicate already exists there", () => {
      localDB.addSubType("Common Design", catBId, admin);
      const subA = localDB.addSubType("Common Design", catAId, admin);

      expect(() => localDB.updateSubType(subA.id, "Common Design", catBId, admin)).toThrowError(
        'Sub-Type "Common Design" already exists under this category.'
      );
    });
  });

  describe("SOFT DELETE & RESTORE Operations", () => {
    it("soft deletes subtype: removed from active query, preserved in deleted", () => {
      const sub = localDB.addSubType("To Delete Sub", catAId, admin);
      expect(localDB.getSubTypes().some(s => s.id === sub.id)).toBe(true);

      const deleted = localDB.softDelete("sub_types", sub.id);
      expect(deleted).toBe(true);

      expect(localDB.getSubTypes().some(s => s.id === sub.id)).toBe(false);
      expect(localDB.getDeletedSubTypes().some(s => s.id === sub.id)).toBe(true);
    });

    it("restores soft deleted subtype successfully", () => {
      const sub = localDB.addSubType("Restorable Sub", catAId, admin);
      localDB.softDelete("sub_types", sub.id);

      const restored = localDB.restore("sub_types", sub.id);
      expect(restored).toBe(true);
      expect(localDB.getSubTypes().some(s => s.id === sub.id)).toBe(true);
    });
  });

  describe("Foreign Key Boundary Edge Cases (BUG-010)", () => {
    it("documents behavior when creating subtype under non-existent category ID", () => {
      // Current implementation does not check whether categoryId exists in categories
      const sub = localDB.addSubType("Phantom Subtype", "cat-non-existent-9999", admin);
      expect(sub).toBeDefined();
      expect(sub.category_id).toBe("cat-non-existent-9999");
    });
  });

  describe("RBAC Permissions", () => {
    it("rejects subtype creation by restricted operator", () => {
      const restricted = createRestrictedOperator();
      expect(() => localDB.addSubType("Restricted Sub", catAId, restricted)).toThrowError(
        "Unauthorized: Your user account lacks permission to modify inventory."
      );
    });
  });
});
