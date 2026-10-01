import { localDB } from "../src/lib/mockData";

// Mock window and localStorage for Node.js environment
(global as any).window = {
  localStorage: {
    store: {} as Record<string, string>,
    getItem(key: string) { return this.store[key] || null; },
    setItem(key: string, val: string) { this.store[key] = val; },
    removeItem(key: string) { delete this.store[key]; },
    clear() { this.store = {}; }
  },
  sessionStorage: {
    store: {} as Record<string, string>,
    getItem(key: string) { return this.store[key] || null; },
    setItem(key: string, val: string) { this.store[key] = val; },
    removeItem(key: string) { delete this.store[key]; }
  }
};
(global as any).fetch = async () => ({ ok: true, json: async () => ({}) });

console.log("==========================================================");
console.log("=== RUNNING MASTER COMPREHENSIVE CRUD TEST SUITE (100%) ===");
console.log("==========================================================\n");

// Seed initial state
localDB.resetSeed();

// ------------------------------------------------------------------------
// MODULE 1: CATEGORIES CRUD
// ------------------------------------------------------------------------
console.log("--- MODULE 1: Categories CRUD ---");
const cat1 = localDB.addCategory("Test Category Alpha");
console.log("✓ CREATE Category:", cat1.id, cat1.name);

let categories = localDB.getCategories();
const createdCat = categories.find(c => c.id === cat1.id);
if (!createdCat) throw new Error("Category read failed");
console.log("✓ READ Category:", createdCat.name);

const updatedCat = localDB.updateCategory(cat1.id, "Test Category Alpha Updated");
if (!updatedCat || updatedCat.name !== "Test Category Alpha Updated") throw new Error("Category update failed");
console.log("✓ UPDATE Category:", updatedCat.name);

localDB.softDelete("categories", cat1.id);
categories = localDB.getCategories();
if (categories.some(c => c.id === cat1.id)) throw new Error("Category soft delete failed");
console.log("✓ SOFT DELETE Category: Success");

localDB.restore("categories", cat1.id);
categories = localDB.getCategories();
if (!categories.some(c => c.id === cat1.id)) throw new Error("Category restore failed");
console.log("✓ RESTORE Category: Success\n");

// ------------------------------------------------------------------------
// MODULE 2: SUB-TYPES CRUD
// ------------------------------------------------------------------------
console.log("--- MODULE 2: Sub-Types CRUD ---");
const sub1 = localDB.addSubType(cat1.id, "Test SubType 1");
console.log("✓ CREATE SubType:", sub1.id, sub1.name);

let subTypes = localDB.getSubTypes();
if (!subTypes.some(s => s.id === sub1.id)) throw new Error("SubType read failed");
console.log("✓ READ SubType:", sub1.name);

const updatedSub = localDB.updateSubType(sub1.id, "Test SubType 1 Updated");
if (!updatedSub || updatedSub.name !== "Test SubType 1 Updated") throw new Error("SubType update failed");
console.log("✓ UPDATE SubType:", updatedSub.name);

localDB.softDelete("sub_types", sub1.id);
subTypes = localDB.getSubTypes();
if (subTypes.some(s => s.id === sub1.id)) throw new Error("SubType soft delete failed");
console.log("✓ SOFT DELETE SubType: Success");

localDB.restore("sub_types", sub1.id);
subTypes = localDB.getSubTypes();
if (!subTypes.some(s => s.id === sub1.id)) throw new Error("SubType restore failed");
console.log("✓ RESTORE SubType: Success\n");

// ------------------------------------------------------------------------
// MODULE 3: STORAGE LOCATIONS CRUD
// ------------------------------------------------------------------------
console.log("--- MODULE 3: Storage Locations CRUD ---");
const loc1 = localDB.addLocation("Test Warehouse Delta");
console.log("✓ CREATE Location:", loc1.id, loc1.name);

let locations = localDB.getLocations();
if (!locations.some(l => l.id === loc1.id)) throw new Error("Location read failed");
console.log("✓ READ Location:", loc1.name);

const updatedLoc = localDB.updateLocation(loc1.id, "Test Warehouse Delta Updated");
if (!updatedLoc || updatedLoc.name !== "Test Warehouse Delta Updated") throw new Error("Location update failed");
console.log("✓ UPDATE Location:", updatedLoc.name);

localDB.softDelete("locations", loc1.id);
locations = localDB.getLocations();
if (locations.some(l => l.id === loc1.id)) throw new Error("Location soft delete failed");
console.log("✓ SOFT DELETE Location: Success");

localDB.restore("locations", loc1.id);
locations = localDB.getLocations();
if (!locations.some(l => l.id === loc1.id)) throw new Error("Location restore failed");
console.log("✓ RESTORE Location: Success\n");

// ------------------------------------------------------------------------
// MODULE 4: PRODUCTS CRUD
// ------------------------------------------------------------------------
console.log("--- MODULE 4: Products CRUD ---");
const prod1 = localDB.addProduct("Test Gourmet Box", cat1.id, sub1.id, ["/box.jpg"], 1500, "SUP-888");
console.log("✓ CREATE Product:", prod1.id, prod1.name);

let products = localDB.getProducts();
if (!products.some(p => p.id === prod1.id)) throw new Error("Product read failed");
console.log("✓ READ Product:", prod1.name);

const updatedProd = localDB.updateProduct(prod1.id, "Test Gourmet Box Premium", cat1.id, sub1.id, ["/box_new.jpg"], 1800, "SUP-888-MOD");
if (!updatedProd || updatedProd.price !== 1800) throw new Error("Product update failed");
console.log("✓ UPDATE Product:", updatedProd.name, "Price:", updatedProd.price);

localDB.softDelete("products", prod1.id);
products = localDB.getProducts();
if (products.some(p => p.id === prod1.id)) throw new Error("Product soft delete failed");
console.log("✓ SOFT DELETE Product: Success");

localDB.restore("products", prod1.id);
products = localDB.getProducts();
if (!products.some(p => p.id === prod1.id)) throw new Error("Product restore failed");
console.log("✓ RESTORE Product: Success\n");

// ------------------------------------------------------------------------
// MODULE 5: STOCK & MOVEMENTS CRUD
// ------------------------------------------------------------------------
console.log("--- MODULE 5: Stock Levels & Movements CRUD ---");
localDB.updateStock(prod1.id, loc1.id, 50);
let stockList = localDB.getStock();
let stockRec = stockList.find(s => s.product_id === prod1.id && s.storage_location_id === loc1.id);
if (!stockRec || stockRec.quantity !== 50) throw new Error("Stock update failed");
console.log("✓ UPDATE Stock: Quantity 50 in", loc1.name);

const loc2 = localDB.addLocation("Test Warehouse Echo");
localDB.moveStock(prod1.id, loc1.id, loc2.id, 20, null, { role: "super_admin", username: "TestOperator" });
stockList = localDB.getStock();
const srcStock = stockList.find(s => s.product_id === prod1.id && s.storage_location_id === loc1.id)?.quantity;
const destStock = stockList.find(s => s.product_id === prod1.id && s.storage_location_id === loc2.id)?.quantity;
if (srcStock !== 30 || destStock !== 20) throw new Error("Stock transfer failed");
console.log("✓ TRANSFER Stock: 20 units moved from Src (now 30) to Dest (now 20)");

localDB.addDamagedStock(prod1.id, loc2.id, 5, null, { role: "super_admin", username: "TestOperator" });
const movements = localDB.getStockMovements();
if (movements.length < 3) throw new Error("Stock movements logging failed");
console.log("✓ LOG Stock Movements: Total records logged =", movements.length, "\n");

// ------------------------------------------------------------------------
// MODULE 6: ADDITIVES / DRYFRUITS CRUD
// ------------------------------------------------------------------------
console.log("--- MODULE 6: Additives / Dryfruits CRUD ---");
const add1 = localDB.addAdditive("Test Walnut", 1500, 50);
console.log("✓ CREATE Additive:", add1.id, add1.name, "Price:", add1.price_per_kg, "Stock:", add1.stock_qty_kg, "kg");

let additives = localDB.getAdditives();
if (!additives.some(a => a.id === add1.id)) throw new Error("Additive read failed");
console.log("✓ READ Additive:", add1.name);

const updatedAdd = localDB.updateAdditive(add1.id, "Test Walnut Jumbo", 1600, 50);
if (!updatedAdd || updatedAdd.price_per_kg !== 1600) throw new Error("Additive update failed");
console.log("✓ UPDATE Additive:", updatedAdd.name, "Price:", updatedAdd.price_per_kg);

// ------------------------------------------------------------------------
// MODULE 7: INVOICES & DRYFRUIT BILLING CRUD
// ------------------------------------------------------------------------
console.log("--- MODULE 7: Invoices & Dryfruit Billing CRUD ---");

// Test 7A-1: 200 Grams (0.20 kg) Exact Dryfruit Billing & Deduction Test
const inv200g = localDB.createInvoice(
  "Test Customer 200g Sale",
  "9876543200",
  [{ additiveId: add1.id, quantity: 0.20, unitPrice: 1600, discount: 0 }],
  "delivered",
  "2026-10-10",
  0,
  "Cash",
  null,
  { role: "super_admin", username: "TestOperator" }
);
if (Math.abs(inv200g.total_amount - 320) > 0.01) {
  throw new Error(`200g dryfruit billing math failed. Expected 320, got ${inv200g.total_amount}`);
}
console.log("✓ CREATE 200g (0.20 kg) Dryfruit Invoice:", inv200g.invoice_number, "Total Amount: ₹", inv200g.total_amount);

additives = localDB.getAdditives();
const addAfter200g = additives.find(a => a.id === add1.id);
if (!addAfter200g || Math.abs(addAfter200g.stock_qty_kg - 49.80) > 0.001) {
  throw new Error(`200g dryfruit stock deduction failed. Expected 49.80 kg, got ${addAfter200g?.stock_qty_kg}`);
}
console.log("✓ VERIFY 200g (0.20 kg) Stock Auto-Deduction: Initial 50.00 kg - 0.20 kg (200g) = Exactly", addAfter200g.stock_qty_kg, "kg remaining!");

// Test 7A-2: Standalone / Loose Dryfruit Billing (5.5 kg)
const looseDryfruitInv = localDB.createInvoice(
  "Test Customer Loose Dryfruit",
  "9876543210",
  [{ additiveId: add1.id, quantity: 5.5, unitPrice: 1600, discount: 0 }],
  "delivered",
  "2026-10-10",
  0,
  "Cash",
  null,
  { role: "super_admin", username: "TestOperator" }
);
if (looseDryfruitInv.total_amount !== 8800) throw new Error(`Loose dryfruit billing math failed. Expected 8800, got ${looseDryfruitInv.total_amount}`);
console.log("✓ CREATE Loose Dryfruit Invoice (5.5 kg):", looseDryfruitInv.invoice_number, "Total:", looseDryfruitInv.total_amount);

additives = localDB.getAdditives();
const addRecordAfterLoose = additives.find(a => a.id === add1.id);
if (!addRecordAfterLoose || Math.abs(addRecordAfterLoose.stock_qty_kg - 44.30) > 0.01) {
  throw new Error(`Loose dryfruit stock deduction failed. Expected 44.30 kg, got ${addRecordAfterLoose?.stock_qty_kg}`);
}
console.log("✓ VERIFY Loose Dryfruit Stock Auto-Deduction: Stock remaining =", addRecordAfterLoose.stock_qty_kg, "kg");

// Test 7B: Customized Jar Filling Dryfruit Billing inside Gift Boxes (200g inside a jar * 5 boxes = 1.0 kg)
const jarFillingInv = localDB.createInvoice(
  "Test Customer Jar Filling 200g",
  "9876543211",
  [{ 
    productId: prod1.id, 
    quantity: 5, 
    unitPrice: 1800, 
    discount: 0,
    customizations: [
      { jar_number: 1, additive_id: add1.id, weight_grams: 200 }
    ]
  }],
  "ordered",
  "2026-10-10",
  1000,
  "UPI",
  null,
  { role: "super_admin", username: "TestOperator" }
);
console.log("✓ CREATE Customized Jar Filling Invoice (5 boxes x 200g jar = 1.0 kg):", jarFillingInv.invoice_number, "Total:", jarFillingInv.total_amount);

additives = localDB.getAdditives();
const addRecordAfterJars = additives.find(a => a.id === add1.id);
if (!addRecordAfterJars || Math.abs(addRecordAfterJars.stock_qty_kg - 43.30) > 0.01) {
  throw new Error(`Jar filling dryfruit stock deduction failed. Expected 43.30 kg, got ${addRecordAfterJars?.stock_qty_kg}`);
}
console.log("✓ VERIFY Jar Filling Dryfruit Stock Auto-Deduction: Stock remaining =", addRecordAfterJars.stock_qty_kg, "kg");

// Test 7C: Insufficient Dryfruit Stock Validation
let threwStockError = false;
try {
  localDB.createInvoice(
    "Over-limit Customer",
    "9999999999",
    [{ additiveId: add1.id, quantity: 100, unitPrice: 1600, discount: 0 }],
    "ordered"
  );
} catch (err: any) {
  if (err.message.includes("Insufficient stock")) threwStockError = true;
}
if (!threwStockError) throw new Error("Insufficient dryfruit stock validation failed to throw expected error");
console.log("✓ VERIFY Insufficient Dryfruit Stock Validation: Blocked over-stock sale cleanly");

const updatedInv = localDB.updateInvoiceStatus(jarFillingInv.id, "delivered");
if (!updatedInv || updatedInv.status !== "delivered") throw new Error("Invoice status update failed");
console.log("✓ UPDATE Invoice Status: Status changed to", updatedInv.status);

localDB.softDelete("invoices", jarFillingInv.id);
let invoices = localDB.getInvoices();
if (invoices.some(i => i.id === jarFillingInv.id)) throw new Error("Invoice soft delete failed");
console.log("✓ SOFT DELETE Invoice: Success");

localDB.softDelete("additives", add1.id);
additives = localDB.getAdditives();
if (additives.some(a => a.id === add1.id)) throw new Error("Additive soft delete failed");
console.log("✓ SOFT DELETE Additive: Success\n");

// ------------------------------------------------------------------------
// MODULE 8: USER ACCOUNTS & RBAC CRUD
// ------------------------------------------------------------------------
console.log("--- MODULE 8: User Accounts & RBAC CRUD ---");
const testUser = localDB.createUser("testoperator_crud", "hash12345", { view_stock: true, generate_bill: true, edit_inventory: true }, "operator");
console.log("✓ CREATE User:", testUser.id, testUser.username, "Role:", testUser.role);

let users = localDB.getUsers();
if (!users.some(u => u.id === testUser.id)) throw new Error("User read failed");
console.log("✓ READ User:", testUser.username);

const passwordUser = localDB.changeUserPassword(testUser.id, "newhash56789");
if (!passwordUser || passwordUser.password_hash !== "newhash56789") throw new Error("User password change failed");
console.log("✓ UPDATE User Password: Hash updated");

const rightsUser = localDB.updateUserRights(testUser.id, { view_stock: true, generate_bill: false, edit_inventory: false }, "usr-admin");
if (!rightsUser || rightsUser.rights.generate_bill !== false) throw new Error("User rights update failed");
console.log("✓ UPDATE User Rights: Permissions updated");

localDB.deleteUser(testUser.id, "usr-admin");
users = localDB.getUsers();
if (users.some(u => u.id === testUser.id)) throw new Error("User soft delete failed");
console.log("✓ SOFT DELETE User: Success\n");

console.log("==========================================================");
console.log("🎉 ALL 8 CRUD MODULES PASSED 100% WITH ZERO ERRORS! 🎉");
console.log("==========================================================");
