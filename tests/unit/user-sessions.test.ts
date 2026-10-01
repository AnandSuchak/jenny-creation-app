import { describe, it, expect, beforeEach } from "vitest";
import { localDB } from "@/lib/mockData";
import { createSuperAdminUser } from "../fixtures/factories";

describe("User Sessions, Single-Device Lock & Authentication Tests", () => {
  const admin = createSuperAdminUser();

  beforeEach(() => {
    localStorage.clear();
  });

  it("updates and verifies single-device session lock tokens", () => {
    const user = localDB.createUser("kavita", "hash_kavita", { view_stock: true, generate_bill: true, edit_inventory: false });
    expect(user.current_session_token).toBeNull();

    // Device A logs in
    const tokenA = "SESS-DEVICE-A-12345";
    localDB.updateUserSessionToken(user.id, tokenA);

    let current = localDB.getUsers().find(u => u.id === user.id);
    expect(current?.current_session_token).toBe(tokenA);

    // Device B logs in with same user account (overwrites session token)
    const tokenB = "SESS-DEVICE-B-67890";
    localDB.updateUserSessionToken(user.id, tokenB);

    current = localDB.getUsers().find(u => u.id === user.id);
    expect(current?.current_session_token).toBe(tokenB);

    // Device A's token no longer matches the database token -> triggers logout
    expect(current?.current_session_token === tokenA).toBe(false);
  });

  it("enforces require_password_change flag on admin reset and clears on change", () => {
    const user = localDB.createUser("suresh", "initial_hash", { view_stock: true, generate_bill: true, edit_inventory: false });

    // Admin resets password
    const resetUser = localDB.resetUserPassword(user.id, "temp_hash_123", "usr-admin");
    expect(resetUser.require_password_change).toBe(true);

    // User submits new password
    const finalizedUser = localDB.changeUserPassword(user.id, "new_secure_hash_456");
    expect(finalizedUser.require_password_change).toBe(false);
    expect(finalizedUser.password_hash).toBe("new_secure_hash_456");
  });

  it("soft-deletes user account and hides from active user queries", () => {
    const user = localDB.createUser("temp_staff", "staff_hash", { view_stock: true, generate_bill: false, edit_inventory: false });
    expect(localDB.getUsers().some(u => u.id === user.id)).toBe(true);

    localDB.deleteUser(user.id, "usr-admin");
    expect(localDB.getUsers().some(u => u.id === user.id)).toBe(false);
  });

  it("safely handles corrupted/malformed session JSON strings", () => {
    localStorage.setItem("jenny_session_user", "{ broken-invalid-json: ");
    const session = localDB.getCurrentSessionUser();
    expect(session).toBeNull();
  });
});
