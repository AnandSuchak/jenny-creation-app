import { User, Category, SubType, Product, StorageLocation, Stock, Additive, Invoice, InvoiceItem } from "@/lib/mockData";

export const createTestUser = (overrides?: Partial<User>): User => ({
  id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  username: "testuser",
  password_hash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
  role: "operator",
  rights: {
    view_stock: true,
    generate_bill: true,
    edit_inventory: true
  },
  created_at: new Date().toISOString(),
  deleted_at: null,
  require_password_change: false,
  current_session_token: null,
  ...overrides
});

export const createSuperAdminUser = (overrides?: Partial<User>): User =>
  createTestUser({
    id: "usr-admin",
    username: "superadmin",
    role: "super_admin",
    rights: {
      view_stock: true,
      generate_bill: true,
      edit_inventory: true
    },
    ...overrides
  });

export const createRestrictedOperator = (overrides?: Partial<User>): User =>
  createTestUser({
    id: `usr-restricted-${Date.now()}`,
    username: "restricted_op",
    role: "operator",
    rights: {
      view_stock: false,
      generate_bill: false,
      edit_inventory: false
    },
    ...overrides
  });

export const createTestCategory = (overrides?: Partial<Category>): Category => ({
  id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  name: "Premium Box",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
  ...overrides
});

export const createTestSubType = (categoryId: string, overrides?: Partial<SubType>): SubType => ({
  id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  category_id: categoryId,
  name: "2 Jar Velvet",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
  ...overrides
});

export const createTestLocation = (overrides?: Partial<StorageLocation>): StorageLocation => ({
  id: `loc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  name: "Main Warehouse",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
  ...overrides
});

export const createTestProduct = (categoryId: string, subTypeId: string, overrides?: Partial<Product>): Product => ({
  id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  name: "Royal Peacock Box",
  category_id: categoryId,
  sub_type_id: subTypeId,
  photos: ["https://example.com/photo.jpg"],
  price: 500,
  supplier_code: "SUP-ROYAL-01",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
  ...overrides
});

export const createTestAdditive = (overrides?: Partial<Additive>): Additive => ({
  id: `add-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  name: "Cashews (Kaju)",
  price_per_kg: 900,
  stock_qty_kg: 25,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
  ...overrides
});

export const createTestStock = (locationId: string, overrides?: Partial<Stock>): Stock => ({
  id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  product_id: null,
  additive_id: null,
  storage_location_id: locationId,
  quantity: 50,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
  ...overrides
});
