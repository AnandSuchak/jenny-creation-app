import { describe, it, expect, beforeEach } from "vitest";
import { localDB } from "@/lib/mockData";
import { createSuperAdminUser, createTestUser } from "../fixtures/factories";

describe("Role-Based Access Control (RBAC) & Permission Security Tests", () => {
  const superAdmin = createSuperAdminUser();

  beforeEach(() => {
    localStorage.clear();
  });

  describe("Primary Super Admin Account Immutability Guard", () => {
    it("strictly prevents deletion of primary Super Admin account ('usr-admin')", () => {
      expect(() => localDB.deleteUser("usr-admin", "usr-other-admin")).toThrowError(
        "Cannot delete primary Super Admin account."
      );
    });

    it("strictly prevents self-deletion by logged-in user", () => {
      expect(() => localDB.deleteUser("usr-anand", "usr-anand")).toThrowError(
        "Cannot delete your own currently logged-in account."
      );
    });

    it("strictly prevents modifying rights of primary Super Admin account", () => {
      expect(() =>
        localDB.updateUserRights("usr-admin", { view_stock: false, generate_bill: false, edit_inventory: false }, "usr-admin")
      ).toThrowError("Cannot modify rights for primary Super Admin.");
    });

    it("strictly prevents resetting password of primary Super Admin account", () => {
      expect(() =>
        localDB.resetUserPassword("usr-admin", "somehash", "usr-admin")
      ).toThrowError("Cannot reset the primary Super Admin account's password.");
    });
  });

  describe("Operator Granular Permission Enforcement", () => {
    it("prohibits non-admin user from updating rights or resetting passwords", () => {
      const op = createTestUser({ id: "usr-op-1", role: "operator" });
      const op2 = createTestUser({ id: "usr-op-2", role: "operator" });

      expect(() =>
        localDB.updateUserRights(op2.id, { view_stock: true, generate_bill: true, edit_inventory: true }, op.id)
      ).toThrowError("Unauthorized: Only Super Admins can update user permissions.");

      expect(() =>
        localDB.resetUserPassword(op2.id, "somehash", op.id)
      ).toThrowError("Unauthorized: Only Super Admins can reset user passwords.");
    });

    it("allows Super Admin to update operator permissions cleanly", () => {
      const op = localDB.createUser("test_operator", "hash123", { view_stock: true, generate_bill: false, edit_inventory: false });

      const updated = localDB.updateUserRights(op.id, { view_stock: true, generate_bill: true, edit_inventory: true }, "usr-admin");
      expect(updated.rights.generate_bill).toBe(true);
      expect(updated.rights.edit_inventory).toBe(true);
    });
  });
});
