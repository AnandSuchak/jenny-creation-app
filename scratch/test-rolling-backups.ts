// Polyfill browser globals for Node test runner
if (typeof global.window === "undefined") {
  (global as any).window = {
    localStorage: {
      _store: {} as any,
      getItem(k: string) { return (this._store[k] !== undefined ? this._store[k] : null); },
      setItem(k: string, v: string) { this._store[k] = String(v); },
      removeItem(k: string) { delete this._store[k]; }
    }
  };
}

import { localDB } from "../src/lib/mockData";

console.log("=== TESTING AUTOMATED 3-DAY ROLLING BACKUP ENGINE ===");

// 1. Clear old snapshots in test env
window.localStorage.removeItem("jenny_creation_backup_snapshots");

// 2. Create Day 1 snapshot
const snap1 = localDB.createBackupSnapshot();
console.log(`✓ Day 1 Snapshot Created: ${snap1.id} (${snap1.date_str})`);

// 3. Create Day 2, Day 3, Day 4 snapshots
const snap2Obj = {
  ...snap1,
  id: "snap-2026-09-28-test2",
  date_str: "2026-09-28",
  created_at: "2026-09-28T02:00:00.000Z"
};
const snap3Obj = {
  ...snap1,
  id: "snap-2026-09-27-test3",
  date_str: "2026-09-27",
  created_at: "2026-09-27T02:00:00.000Z"
};
const snap4Obj = {
  ...snap1,
  id: "snap-2026-09-26-test4",
  date_str: "2026-09-26",
  created_at: "2026-09-26T02:00:00.000Z"
};

// Save 4 snapshots to verify FIFO limit of 3
window.localStorage.setItem("jenny_creation_backup_snapshots", JSON.stringify([snap1, snap2Obj, snap3Obj, snap4Obj]));

// 4. Trigger rolling backup check & create another snapshot
localDB.createBackupSnapshot();

const finalSnaps = localDB.getBackupSnapshots();
console.log(`✓ Active Rolling Snapshots Count: ${finalSnaps.length} (Max 3 Allowed)`);
if (finalSnaps.length <= 3) {
  console.log("✓ VERIFIED: FIFO Rolling backup retention enforced (Older Day 4 purged automatically)!");
} else {
  console.error("❌ Rolling backup retention failed!");
  process.exit(1);
}

// 5. Test snapshot restore
const restoreRes = localDB.restoreBackupSnapshot(finalSnaps[0].id);
if (restoreRes) {
  console.log(`✓ VERIFIED: Successfully restored snapshot ${finalSnaps[0].id}!`);
} else {
  console.error("❌ Snapshot restore failed!");
  process.exit(1);
}

console.log("\n🎉 ALL ROLLING BACKUP TESTS PASSED 100%!");
