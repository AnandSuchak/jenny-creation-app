// Mock Database and Client Service for local mode (with localStorage persistence)
// Mimics PostgreSQL relational schema and soft deletes

export interface SellerSettings {
  seller_name: string;
  seller_address: string;
  gstin: string;
  pan: string;
  show_gst_pan: boolean;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SubType {
  id: string;
  category_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  sub_type_id: string;
  photos: string[]; // URLs
  price?: number; // Selling price
  supplier_code?: string; // Supplier code (alphanumeric, optional)
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface StorageLocation {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Stock {
  id: string;
  product_id: string | null;
  additive_id: string | null;
  storage_location_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Additive {
  id: string;
  name: string;
  price_per_kg: number;
  stock_qty_kg: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface JarCustomization {
  jar_number: number;
  additive_id: string; // Additive ID or "empty"
  weight_grams: number;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string | null;
  additive_id?: string | null;
  quantity: number;
  unit_price: number;
  discount?: number; // Discount percentage (0 to 100)
  total_price: number;
  customizations?: JarCustomization[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DamagedStock {
  id: string;
  product_id: string | null;
  additive_id: string | null;
  storage_location_id: string;
  quantity: number;
  reported_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone?: string;
  total_amount: number;
  status: "ordered" | "preparing" | "completed" | "delivered";
  order_id: string; // Unique order ID (ORD-2026-XXXXX)
  delivery_date?: string;
  advance_paid?: number;
  payment_mode?: string; // cash, upi, bank, card etc
  issue_date: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  items?: InvoiceItem[];
}

// Initial seed data
const initialCategories: Category[] = [
  { id: "cat-1", name: "Box", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { id: "cat-2", name: "Puttha", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { id: "cat-3", name: "Laser Cutting", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { id: "cat-4", name: "Basket", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
];

const initialSubTypes: SubType[] = [
  { id: "sub-1", category_id: "cat-1", name: "2 JAR", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { id: "sub-2", category_id: "cat-2", name: "6 Box", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { id: "sub-3", category_id: "cat-3", name: "Peacock Design", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { id: "sub-4", category_id: "cat-4", name: "Peacock Design", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
];

const initialLocations: StorageLocation[] = [
  { id: "loc-1", name: "Warehouse 1", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { id: "loc-2", name: "Warehouse 2", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { id: "loc-3", name: "Warehouse 3", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { id: "loc-4", name: "Warehouse 4", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { id: "loc-5", name: "Display", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
];

const initialProducts: Product[] = [
  {
    id: "prod-1",
    name: "2 JAR Gift Box",
    category_id: "cat-1", // Box
    sub_type_id: "sub-1",  // 2 JAR
    photos: ["/gift_box_2jar.jpg"],
    price: 450,
    supplier_code: "SUP-BOX-02J",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: "prod-2",
    name: "Peacock Laser Cut Tray",
    category_id: "cat-3", // Laser Cutting
    sub_type_id: "sub-3",  // Peacock Design
    photos: ["/peacock_tray.jpg"],
    price: 1250,
    supplier_code: "SUP-LSR-PCO",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: "prod-3",
    name: "6 Box Premium Puttha Set",
    category_id: "cat-2", // Puttha
    sub_type_id: "sub-2",  // 6 Box
    photos: ["https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60"],
    price: 850,
    supplier_code: "SUP-PTH-06B",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: "prod-4",
    name: "Peacock Design Basket",
    category_id: "cat-4", // Basket
    sub_type_id: "sub-3",  // Peacock Design
    photos: ["https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=60"],
    price: 600,
    supplier_code: "SUP-BSK-PCO",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  }
];

const initialStock: Stock[] = [
  { id: "st-1", product_id: "prod-1", additive_id: null, storage_location_id: "loc-1", quantity: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { id: "st-2", product_id: "prod-2", additive_id: null, storage_location_id: "loc-5", quantity: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { id: "st-3", product_id: "prod-3", additive_id: null, storage_location_id: "loc-2", quantity: 25, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { id: "st-4", product_id: "prod-4", additive_id: null, storage_location_id: "loc-3", quantity: 15, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  // Seed dryfruits stock allocations in locations
  { id: "st-add-1", product_id: null, additive_id: "add-1", storage_location_id: "loc-1", quantity: 25, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { id: "st-add-2", product_id: null, additive_id: "add-2", storage_location_id: "loc-1", quantity: 30, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { id: "st-add-3", product_id: null, additive_id: "add-3", storage_location_id: "loc-2", quantity: 12, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { id: "st-add-4", product_id: null, additive_id: "add-4", storage_location_id: "loc-3", quantity: 18, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
];

const initialInvoices: Invoice[] = [
  {
    id: "inv-1",
    invoice_number: "INV-2026-001",
    customer_name: "Aryan Sharma",
    total_amount: 1200.00,
    status: "delivered",
    order_id: "ORD-2026-A1B2C",
    issue_date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: "inv-2",
    invoice_number: "INV-2026-002",
    customer_name: "Nisha Patel",
    total_amount: 4500.00,
    status: "preparing",
    order_id: "ORD-2026-D3E4F",
    delivery_date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], // 5 days from now
    advance_paid: 1500,
    issue_date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: "inv-3",
    invoice_number: "INV-2026-003",
    customer_name: "Rajesh Kumar",
    customer_phone: "9876543210",
    total_amount: 135000.00,
    status: "preparing",
    order_id: "ORD-2026-TODAY",
    delivery_date: new Date().toISOString().split('T')[0], // Today!
    advance_paid: 50000,
    issue_date: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: "inv-4",
    invoice_number: "INV-2026-004",
    customer_name: "Sanjay Mehta",
    customer_phone: "9123456789",
    total_amount: 90000.00,
    status: "ordered",
    order_id: "ORD-2026-TOMORROW",
    delivery_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow!
    advance_paid: 20000,
    issue_date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  }
];

const initialInvoiceItems: InvoiceItem[] = [
  {
    id: "ivi-1",
    invoice_id: "inv-1",
    product_id: "prod-1",
    quantity: 12,
    unit_price: 100.00,
    total_price: 1200.00,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: "ivi-2",
    invoice_id: "inv-2",
    product_id: "prod-3",
    quantity: 10,
    unit_price: 450.00,
    total_price: 4500.00,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: "ivi-3",
    invoice_id: "inv-3",
    product_id: "prod-1",
    quantity: 300,
    unit_price: 450.00,
    total_price: 135000.00,
    customizations: [
      { jar_number: 1, additive_id: "add-1", weight_grams: 100 },
      { jar_number: 2, additive_id: "add-3", weight_grams: 150 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  },
  {
    id: "ivi-4",
    invoice_id: "inv-4",
    product_id: "prod-1",
    quantity: 200,
    unit_price: 450.00,
    total_price: 90000.00,
    customizations: [
      { jar_number: 1, additive_id: "add-2", weight_grams: 100 },
      { jar_number: 2, additive_id: "add-4", weight_grams: 100 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  }
];

const initialAdditives: Additive[] = [
  { id: "add-1", name: "Kaju", price_per_kg: 800, stock_qty_kg: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { id: "add-2", name: "Badam", price_per_kg: 900, stock_qty_kg: 15, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { id: "add-3", name: "Pista", price_per_kg: 1200, stock_qty_kg: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { id: "add-4", name: "Kismis", price_per_kg: 400, stock_qty_kg: 8, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { id: "add-5", name: "Rabdi Kaju", price_per_kg: 1400, stock_qty_kg: 12, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
];

const initialDamagedStock: DamagedStock[] = [];

// Helper to get from localstorage or use defaults
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = window.localStorage.getItem(`jenny_creation_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(error);
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`jenny_creation_${key}`, JSON.stringify(value));
  } catch (error) {
    console.error(error);
  }
};

// Database state management
class LocalDB {
  getCategories(): Category[] {
    return getStorageItem("categories", initialCategories).filter(c => c.deleted_at === null);
  }
  
  getSubTypes(): SubType[] {
    return getStorageItem("sub_types", initialSubTypes).filter(s => s.deleted_at === null);
  }
  
  getLocations(): StorageLocation[] {
    return getStorageItem("locations", initialLocations).filter(l => l.deleted_at === null);
  }
  
  getProducts(): Product[] {
    const productsList = getStorageItem<Product[]>("products", initialProducts);
    
    const seenIds = new Set<string>();
    let hasDuplicates = false;
    
    for (const p of productsList) {
      if (seenIds.has(p.id)) {
        hasDuplicates = true;
        break;
      }
      seenIds.add(p.id);
    }
    
    if (hasDuplicates) {
      console.warn("Detected duplicate product IDs in localStorage. Sanitizing product tables...");
      const idMap = new Map<string, string>();
      const cleanedProducts: Product[] = [];
      const usedIds = new Set<string>();
      
      for (const p of productsList) {
        if (usedIds.has(p.id)) {
          const newId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          idMap.set(p.id, newId);
          cleanedProducts.push({ ...p, id: newId });
          usedIds.add(newId);
        } else {
          cleanedProducts.push(p);
          usedIds.add(p.id);
        }
      }
      
      setStorageItem("products", cleanedProducts);
      
      // Clean corresponding stock tables
      const stockList = getStorageItem<Stock[]>("stock", initialStock);
      let stockUpdated = false;
      const cleanedStock = stockList.map(st => {
        if (st.product_id && idMap.has(st.product_id)) {
          stockUpdated = true;
          return { ...st, product_id: idMap.get(st.product_id)! };
        }
        return st;
      });
      if (stockUpdated) {
        setStorageItem("stock", cleanedStock);
      }
      
      // Clean corresponding invoice items
      const invoiceItemsList = getStorageItem<InvoiceItem[]>("invoice_items", initialInvoiceItems);
      let invoiceItemsUpdated = false;
      const cleanedInvoiceItems = invoiceItemsList.map(item => {
        if (item.product_id && idMap.has(item.product_id)) {
          invoiceItemsUpdated = true;
          return { ...item, product_id: idMap.get(item.product_id)! };
        }
        return item;
      });
      if (invoiceItemsUpdated) {
        setStorageItem("invoice_items", cleanedInvoiceItems);
      }
      
      return cleanedProducts.filter(p => p.deleted_at === null);
    }
    
    return productsList.filter(p => p.deleted_at === null);
  }

  getStock(): Stock[] {
    return getStorageItem("stock", initialStock).filter(st => st.deleted_at === null);
  }

  getInvoices(): Invoice[] {
    const invoices = getStorageItem("invoices", initialInvoices).filter(i => i.deleted_at === null);
    const invoiceItems = getStorageItem("invoice_items", initialInvoiceItems).filter(item => item.deleted_at === null);
    
    return invoices.map(inv => ({
      ...inv,
      items: invoiceItems.filter(item => item.invoice_id === inv.id)
    }));
  }

  // Soft Delete generic
  softDelete(table: string, id: string): boolean {
    const now = new Date().toISOString();
    if (table === "products") {
      const list = getStorageItem<Product[]>("products", initialProducts);
      const updated = list.map(item => item.id === id ? { ...item, deleted_at: now } : item);
      setStorageItem("products", updated);
      return true;
    }
    if (table === "stock") {
      const list = getStorageItem<Stock[]>("stock", initialStock);
      const updated = list.map(item => item.id === id ? { ...item, deleted_at: now } : item);
      setStorageItem("stock", updated);
      return true;
    }
    if (table === "invoices") {
      const list = getStorageItem<Invoice[]>("invoices", initialInvoices);
      const updated = list.map(item => item.id === id ? { ...item, deleted_at: now } : item);
      setStorageItem("invoices", updated);
      return true;
    }
    if (table === "categories") {
      const list = getStorageItem<Category[]>("categories", initialCategories);
      const updated = list.map(item => item.id === id ? { ...item, deleted_at: now } : item);
      setStorageItem("categories", updated);
      return true;
    }
    if (table === "sub_types") {
      const list = getStorageItem<SubType[]>("sub_types", initialSubTypes);
      const updated = list.map(item => item.id === id ? { ...item, deleted_at: now } : item);
      setStorageItem("sub_types", updated);
      return true;
    }
    if (table === "locations") {
      const list = getStorageItem<StorageLocation[]>("locations", initialLocations);
      const updated = list.map(item => item.id === id ? { ...item, deleted_at: now } : item);
      setStorageItem("locations", updated);
      return true;
    }
    if (table === "additives") {
      const list = getStorageItem<Additive[]>("additives", initialAdditives);
      const updated = list.map(item => item.id === id ? { ...item, deleted_at: now } : item);
      setStorageItem("additives", updated);
      return true;
    }
    if (table === "damaged_stock") {
      const list = getStorageItem<DamagedStock[]>("damaged_stock", initialDamagedStock);
      const updated = list.map(item => item.id === id ? { ...item, deleted_at: now } : item);
      setStorageItem("damaged_stock", updated);
      return true;
    }
    return false;
  }

  restore(table: string, id: string): boolean {
    if (table === "products") {
      const list = getStorageItem<Product[]>("products", initialProducts);
      const updated = list.map(item => item.id === id ? { ...item, deleted_at: null } : item);
      setStorageItem("products", updated);
      return true;
    }
    if (table === "stock") {
      const list = getStorageItem<Stock[]>("stock", initialStock);
      const updated = list.map(item => item.id === id ? { ...item, deleted_at: null } : item);
      setStorageItem("stock", updated);
      return true;
    }
    if (table === "invoices") {
      const list = getStorageItem<Invoice[]>("invoices", initialInvoices);
      const updated = list.map(item => item.id === id ? { ...item, deleted_at: null } : item);
      setStorageItem("invoices", updated);
      return true;
    }
    if (table === "categories") {
      const list = getStorageItem<Category[]>("categories", initialCategories);
      const updated = list.map(item => item.id === id ? { ...item, deleted_at: null } : item);
      setStorageItem("categories", updated);
      return true;
    }
    if (table === "sub_types") {
      const list = getStorageItem<SubType[]>("sub_types", initialSubTypes);
      const updated = list.map(item => item.id === id ? { ...item, deleted_at: null } : item);
      setStorageItem("sub_types", updated);
      return true;
    }
    if (table === "locations") {
      const list = getStorageItem<StorageLocation[]>("locations", initialLocations);
      const updated = list.map(item => item.id === id ? { ...item, deleted_at: null } : item);
      setStorageItem("locations", updated);
      return true;
    }
    if (table === "additives") {
      const list = getStorageItem<Additive[]>("additives", initialAdditives);
      const updated = list.map(item => item.id === id ? { ...item, deleted_at: null } : item);
      setStorageItem("additives", updated);
      return true;
    }
    if (table === "damaged_stock") {
      const list = getStorageItem<DamagedStock[]>("damaged_stock", initialDamagedStock);
      const updated = list.map(item => item.id === id ? { ...item, deleted_at: null } : item);
      setStorageItem("damaged_stock", updated);
      return true;
    }
    return false;
  }

  getDeletedCategories(): Category[] {
    return getStorageItem("categories", initialCategories).filter(c => c.deleted_at !== null);
  }

  getDeletedSubTypes(): SubType[] {
    return getStorageItem("sub_types", initialSubTypes).filter(s => s.deleted_at !== null);
  }

  getDeletedLocations(): StorageLocation[] {
    return getStorageItem("locations", initialLocations).filter(l => l.deleted_at !== null);
  }

  getDeletedProducts(): Product[] {
    return getStorageItem("products", initialProducts).filter(p => p.deleted_at !== null);
  }

  getDeletedInvoices(): Invoice[] {
    return getStorageItem("invoices", initialInvoices).filter(i => i.deleted_at !== null);
  }

  updateCategory(id: string, name: string): Category | null {
    const list = getStorageItem<Category[]>("categories", initialCategories);
    
    const nameLower = name.trim().toLowerCase();
    const exists = list.some(c => c.id !== id && c.name.toLowerCase() === nameLower && c.deleted_at === null);
    if (exists) throw new Error(`Category "${name.trim()}" already exists.`);

    const idx = list.findIndex(c => c.id === id);
    if (idx >= 0) {
      list[idx].name = name.trim();
      list[idx].updated_at = new Date().toISOString();
      setStorageItem("categories", list);
      return list[idx];
    }
    return null;
  }

  updateSubType(id: string, name: string, categoryId: string): SubType | null {
    const list = getStorageItem<SubType[]>("sub_types", initialSubTypes);
    
    const nameLower = name.trim().toLowerCase();
    const exists = list.some(s => s.id !== id && s.category_id === categoryId && s.name.toLowerCase() === nameLower && s.deleted_at === null);
    if (exists) throw new Error(`Sub-Type "${name.trim()}" already exists under this category.`);

    const idx = list.findIndex(s => s.id === id);
    if (idx >= 0) {
      list[idx].name = name.trim();
      list[idx].category_id = categoryId;
      list[idx].updated_at = new Date().toISOString();
      setStorageItem("sub_types", list);
      return list[idx];
    }
    return null;
  }

  updateLocation(id: string, name: string): StorageLocation | null {
    const list = getStorageItem<StorageLocation[]>("locations", initialLocations);
    
    const nameLower = name.trim().toLowerCase();
    const exists = list.some(l => l.id !== id && l.name.toLowerCase() === nameLower && l.deleted_at === null);
    if (exists) throw new Error(`Storage location "${name.trim()}" already exists.`);

    const idx = list.findIndex(l => l.id === id);
    if (idx >= 0) {
      list[idx].name = name.trim();
      list[idx].updated_at = new Date().toISOString();
      setStorageItem("locations", list);
      return list[idx];
    }
    return null;
  }

  // Insert product
  addProduct(name: string, categoryId: string, subTypeId: string, photos: string[], price: number, supplierCode?: string): Product {
    const list = getStorageItem<Product[]>("products", initialProducts);
    const newProduct: Product = {
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      category_id: categoryId,
      sub_type_id: subTypeId,
      photos: photos.length > 0 ? photos : ["https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60"],
      price,
      supplier_code: supplierCode || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
    list.push(newProduct);
    setStorageItem("products", list);
    return newProduct;
  }

  updateProduct(id: string, name: string, categoryId: string, subTypeId: string, photos: string[], price: number, supplierCode?: string): Product | null {
    const list = getStorageItem<Product[]>("products", initialProducts);
    const idx = list.findIndex(p => p.id === id);
    if (idx >= 0) {
      list[idx].name = name;
      list[idx].category_id = categoryId;
      list[idx].sub_type_id = subTypeId;
      list[idx].photos = photos.length > 0 ? photos : ["https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60"];
      list[idx].price = price;
      list[idx].supplier_code = supplierCode || undefined;
      list[idx].updated_at = new Date().toISOString();
      setStorageItem("products", list);
      return list[idx];
    }
    return null;
  }

  // Insert category
  addCategory(name: string): Category {
    const list = getStorageItem<Category[]>("categories", initialCategories);
    
    const nameLower = name.trim().toLowerCase();
    const exists = list.some(c => c.name.toLowerCase() === nameLower && c.deleted_at === null);
    if (exists) throw new Error(`Category "${name.trim()}" already exists.`);

    const newItem: Category = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
    list.push(newItem);
    setStorageItem("categories", list);
    return newItem;
  }

  // Insert sub-type
  addSubType(name: string, categoryId: string): SubType {
    const list = getStorageItem<SubType[]>("sub_types", initialSubTypes);
    
    const nameLower = name.trim().toLowerCase();
    const exists = list.some(s => s.category_id === categoryId && s.name.toLowerCase() === nameLower && s.deleted_at === null);
    if (exists) throw new Error(`Sub-Type "${name.trim()}" already exists under this category.`);

    const newItem: SubType = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      category_id: categoryId,
      name: name.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
    list.push(newItem);
    setStorageItem("sub_types", list);
    return newItem;
  }

  // Insert location
  addLocation(name: string): StorageLocation {
    const list = getStorageItem<StorageLocation[]>("locations", initialLocations);
    
    const nameLower = name.trim().toLowerCase();
    const exists = list.some(l => l.name.toLowerCase() === nameLower && l.deleted_at === null);
    if (exists) throw new Error(`Storage location "${name.trim()}" already exists.`);

    const newItem: StorageLocation = {
      id: `loc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
    list.push(newItem);
    setStorageItem("locations", list);
    return newItem;
  }

  // Set or update stock quantity
  updateStock(productId: string | null, locationId: string, quantity: number, additiveId: string | null = null): Stock {
    const list = getStorageItem<Stock[]>("stock", initialStock);
    const existingIndex = list.findIndex(
      st => st.product_id === productId && 
            st.additive_id === additiveId && 
            st.storage_location_id === locationId && 
            st.deleted_at === null
    );
    
    if (existingIndex >= 0) {
      list[existingIndex].quantity = quantity;
      list[existingIndex].updated_at = new Date().toISOString();
      setStorageItem("stock", list);
      return list[existingIndex];
    } else {
      const newStock: Stock = {
        id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        product_id: productId,
        additive_id: additiveId,
        storage_location_id: locationId,
        quantity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      };
      list.push(newStock);
      setStorageItem("stock", list);
      return newStock;
    }
  }

  // Move stock between locations
  moveStock(productId: string | null, sourceLocationId: string, destinationLocationId: string, quantity: number, additiveId: string | null = null): boolean {
    if (sourceLocationId === destinationLocationId) {
      throw new Error("Source and destination locations cannot be the same.");
    }
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than zero.");
    }

    const list = getStorageItem<Stock[]>("stock", initialStock);
    
    const sourceIndex = list.findIndex(
      st => st.product_id === productId && 
            st.additive_id === additiveId &&
            st.storage_location_id === sourceLocationId && 
            st.deleted_at === null
    );

    if (sourceIndex === -1 || list[sourceIndex].quantity < quantity) {
      throw new Error("Insufficient stock available at the source location.");
    }

    list[sourceIndex].quantity -= quantity;
    list[sourceIndex].updated_at = new Date().toISOString();

    const destIndex = list.findIndex(
      st => st.product_id === productId && 
            st.additive_id === additiveId &&
            st.storage_location_id === destinationLocationId && 
            st.deleted_at === null
    );

    if (destIndex >= 0) {
      list[destIndex].quantity += quantity;
      list[destIndex].updated_at = new Date().toISOString();
    } else {
      list.push({
        id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        product_id: productId,
        additive_id: additiveId,
        storage_location_id: destinationLocationId,
        quantity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      });
    }

    setStorageItem("stock", list);
    return true;
  }

  // Create Invoice
  createInvoice(customerName: string, customerPhone: string, items: { productId: string | null; additiveId?: string | null; quantity: number; unitPrice: number; discount: number; customizations?: JarCustomization[] }[], status: "ordered" | "preparing" | "completed" | "delivered" = "ordered", deliveryDate?: string, advancePaid?: number, paymentMode?: string): Invoice {
    const invoices = getStorageItem<Invoice[]>("invoices", initialInvoices);
    const invoiceItems = getStorageItem<InvoiceItem[]>("invoice_items", initialInvoiceItems);
    
    const invoiceId = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const invoiceNumber = `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`;
    
    const stocks = getStorageItem<Stock[]>("stock", initialStock);
    const products = getStorageItem<Product[]>("products", initialProducts);
    const additives = getStorageItem<Additive[]>("additives", initialAdditives);
 
    const isPreOrder = deliveryDate && deliveryDate.trim() !== "";

    // 1. Pre-validation checks for products and dryfruits shortages
    for (const item of items) {
      if (item.productId) {
        const activeProductStocks = stocks.filter(st => st.product_id === item.productId && st.deleted_at === null);
        const totalAvailable = activeProductStocks.reduce((sum, s) => sum + s.quantity, 0);
        
        if (totalAvailable < item.quantity && !isPreOrder) {
          const prod = products.find(p => p.id === item.productId);
          const productName = prod ? prod.name : "Product";
          throw new Error(`Insufficient stock for "${productName}". Requested: ${item.quantity}, Available: ${totalAvailable}`);
        }
        
        const dryfruitsNeeded: { [id: string]: number } = {};
        item.customizations?.forEach(jar => {
          if (jar.additive_id !== "empty" && jar.weight_grams > 0) {
            dryfruitsNeeded[jar.additive_id] = (dryfruitsNeeded[jar.additive_id] || 0) + (jar.weight_grams * item.quantity) / 1000;
          }
        });
        
        for (const [addId, weightNeeded] of Object.entries(dryfruitsNeeded)) {
          const activeAddStocks = stocks.filter(s => s.additive_id === addId && s.deleted_at === null);
          const totalAddAvail = activeAddStocks.reduce((sum, s) => sum + s.quantity, 0);
          if (totalAddAvail < weightNeeded && !isPreOrder) {
            const addObj = additives.find(a => a.id === addId);
            throw new Error(`Insufficient stock of dryfruit ingredient "${addObj ? addObj.name : "Additive"}" for jar fillings. Required: ${weightNeeded.toFixed(2)} kg, Available: ${totalAddAvail.toFixed(2)} kg`);
          }
        }
      } else if (item.additiveId) {
        const activeAddStocks = stocks.filter(st => st.additive_id === item.additiveId && st.deleted_at === null);
        const totalAvailable = activeAddStocks.reduce((sum, s) => sum + s.quantity, 0);
        
        if (totalAvailable < item.quantity && !isPreOrder) {
          const addObj = additives.find(a => a.id === item.additiveId);
          throw new Error(`Insufficient stock for loose dryfruit "${addObj ? addObj.name : "Dryfruit"}". Requested: ${item.quantity} kg, Available: ${totalAvailable} kg`);
        }
      }
    }
 
    let totalAmount = 0;
    const newItems: InvoiceItem[] = items.map((item, idx) => {
      const discountVal = item.discount || 0;
      const totalPrice = item.quantity * item.unitPrice * (1 - discountVal / 100);
      totalAmount += totalPrice;
      
      if (item.productId) {
        let remainingToDeduct = item.quantity;
        const activeProductStocks = stocks.filter(st => st.product_id === item.productId && st.deleted_at === null);
        
        for (const st of activeProductStocks) {
          if (remainingToDeduct <= 0) break;
          const qtyDeducted = Math.min(st.quantity, remainingToDeduct);
          st.quantity -= qtyDeducted;
          st.updated_at = new Date().toISOString();
          remainingToDeduct -= qtyDeducted;

          item.customizations?.forEach(jar => {
            if (jar.additive_id !== "empty" && jar.weight_grams > 0) {
              const weightToDeduct = (jar.weight_grams * qtyDeducted) / 1000;
              let addSt = stocks.find(s => s.additive_id === jar.additive_id && s.storage_location_id === st.storage_location_id && s.deleted_at === null);
              if (!addSt) {
                addSt = {
                  id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                  product_id: null,
                  additive_id: jar.additive_id,
                  storage_location_id: st.storage_location_id,
                  quantity: 0,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  deleted_at: null
                };
                stocks.push(addSt);
              }
              addSt.quantity -= weightToDeduct;
              addSt.updated_at = new Date().toISOString();
            }
          });
        }
        
        if (remainingToDeduct > 0 && isPreOrder) {
          const locations = getStorageItem<StorageLocation[]>("locations", initialLocations);
          const firstLoc = locations.find(l => l.deleted_at === null) || locations[0];
          
          if (firstLoc) {
            let activeBoxSt = activeProductStocks.find(s => s.storage_location_id === firstLoc.id);
            if (!activeBoxSt) {
              activeBoxSt = {
                id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                product_id: item.productId,
                additive_id: null,
                storage_location_id: firstLoc.id,
                quantity: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null
              };
              stocks.push(activeBoxSt);
            }
            activeBoxSt.quantity -= remainingToDeduct;
            activeBoxSt.updated_at = new Date().toISOString();

            item.customizations?.forEach(jar => {
              if (jar.additive_id !== "empty" && jar.weight_grams > 0) {
                const weightToDeduct = (jar.weight_grams * remainingToDeduct) / 1000;
                let addSt = stocks.find(s => s.additive_id === jar.additive_id && s.storage_location_id === firstLoc.id && s.deleted_at === null);
                if (!addSt) {
                  addSt = {
                    id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                    product_id: null,
                    additive_id: jar.additive_id,
                    storage_location_id: firstLoc.id,
                    quantity: 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    deleted_at: null
                  };
                  stocks.push(addSt);
                }
                addSt.quantity -= weightToDeduct;
                addSt.updated_at = new Date().toISOString();
              }
            });
          }
        }
      } else if (item.additiveId) {
        let remainingToDeduct = item.quantity;
        const activeAddStocks = stocks.filter(st => st.additive_id === item.additiveId && st.deleted_at === null);
        
        for (const st of activeAddStocks) {
          if (remainingToDeduct <= 0) break;
          const qtyDeducted = Math.min(st.quantity, remainingToDeduct);
          st.quantity -= qtyDeducted;
          st.updated_at = new Date().toISOString();
          remainingToDeduct -= qtyDeducted;
        }

        if (remainingToDeduct > 0 && isPreOrder) {
          const locations = getStorageItem<StorageLocation[]>("locations", initialLocations);
          const firstLoc = locations.find(l => l.deleted_at === null) || locations[0];
          if (firstLoc) {
            let activeAddSt = activeAddStocks.find(s => s.storage_location_id === firstLoc.id);
            if (!activeAddSt) {
              activeAddSt = {
                id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                product_id: null,
                additive_id: item.additiveId,
                storage_location_id: firstLoc.id,
                quantity: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null
              };
              stocks.push(activeAddSt);
            }
            activeAddSt.quantity -= remainingToDeduct;
            activeAddSt.updated_at = new Date().toISOString();
          }
        }
      }
 
      return {
        id: `ivi-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
        invoice_id: invoiceId,
        product_id: item.productId,
        additive_id: item.additiveId || null,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount: discountVal,
        total_price: totalPrice,
        customizations: item.customizations,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      };
    });
 
    const orderId = `ORD-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newInvoice: Invoice = {
      id: invoiceId,
      invoice_number: invoiceNumber,
      customer_name: customerName,
      customer_phone: customerPhone || undefined,
      total_amount: totalAmount,
      status,
      order_id: orderId,
      delivery_date: deliveryDate || undefined,
      advance_paid: advancePaid !== undefined ? Number(advancePaid) : undefined,
      payment_mode: paymentMode || "Cash",
      issue_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
 
    invoices.push(newInvoice);
    invoiceItems.push(...newItems);
 
    setStorageItem("invoices", invoices);
    setStorageItem("invoice_items", invoiceItems);
    setStorageItem("stock", stocks);
 
    return {
      ...newInvoice,
      items: newItems
    };
  }

  updateInvoiceStatus(id: string, status: "ordered" | "preparing" | "completed" | "delivered"): Invoice | null {
    const list = getStorageItem<Invoice[]>("invoices", initialInvoices);
    const idx = list.findIndex(i => i.id === id);
    if (idx >= 0) {
      list[idx].status = status;
      list[idx].updated_at = new Date().toISOString();
      setStorageItem("invoices", list);
      return list[idx];
    }
    return null;
  }

  updateInvoice(id: string, customerName: string, customerPhone: string, items: { productId: string | null; additiveId?: string | null; quantity: number; unitPrice: number; discount: number; customizations?: JarCustomization[] }[], status: "ordered" | "preparing" | "completed" | "delivered", deliveryDate?: string, advancePaid?: number, paymentMode?: string): Invoice | null {
    const invoices = getStorageItem<Invoice[]>("invoices", initialInvoices);
    const invoiceItems = getStorageItem<InvoiceItem[]>("invoice_items", initialInvoiceItems);
    const stocks = getStorageItem<Stock[]>("stock", initialStock);
    const products = getStorageItem<Product[]>("products", initialProducts);
    const additives = getStorageItem<Additive[]>("additives", initialAdditives);
    
    const idx = invoices.findIndex(i => i.id === id);
    if (idx < 0) return null;
    
    // 1. Restore old items stock levels (both products and loose dryfruits, including customized jar fillings!)
    const oldItems = invoiceItems.filter(ivi => ivi.invoice_id === id && ivi.deleted_at === null);
    for (const oldItem of oldItems) {
      if (oldItem.product_id) {
        // Restore box stock
        const st = stocks.find(s => s.product_id === oldItem.product_id && s.deleted_at === null);
        if (st) {
          st.quantity += oldItem.quantity;
          st.updated_at = new Date().toISOString();
          
          // Restore customized jar additives inside that box from the same stock record
          oldItem.customizations?.forEach(jar => {
            if (jar.additive_id !== "empty" && jar.weight_grams > 0) {
              const weightToRestore = (jar.weight_grams * oldItem.quantity) / 1000;
              const addSt = stocks.find(s => s.additive_id === jar.additive_id && s.storage_location_id === st.storage_location_id && s.deleted_at === null);
              if (addSt) {
                addSt.quantity += weightToRestore;
                addSt.updated_at = new Date().toISOString();
              }
            }
          });
        }
      } else if (oldItem.additive_id) {
        // Restore loose dryfruits stock
        // Direct loose dryfruits items might specify storage_location_id or we find the first record
        const addSt = stocks.find(s => s.additive_id === oldItem.additive_id && s.deleted_at === null);
        if (addSt) {
          addSt.quantity += oldItem.quantity;
          addSt.updated_at = new Date().toISOString();
        }
      }
    }
    
    const isPreOrder = deliveryDate && deliveryDate.trim() !== "";

    // 2. Validate stock availability for all new items
    for (const item of items) {
      if (item.productId) {
        const activeProductStocks = stocks.filter(st => st.product_id === item.productId && st.deleted_at === null);
        const totalAvailable = activeProductStocks.reduce((sum, s) => sum + s.quantity, 0);
        
        if (totalAvailable < item.quantity && !isPreOrder) {
          const prod = products.find(p => p.id === item.productId);
          const productName = prod ? prod.name : "Product";
          throw new Error(`Insufficient stock for "${productName}". Requested: ${item.quantity}, Available: ${totalAvailable} (Note: Stock levels reverted)`);
        }

        const dryfruitsNeeded: { [id: string]: number } = {};
        item.customizations?.forEach(jar => {
          if (jar.additive_id !== "empty" && jar.weight_grams > 0) {
            dryfruitsNeeded[jar.additive_id] = (dryfruitsNeeded[jar.additive_id] || 0) + (jar.weight_grams * item.quantity) / 1000;
          }
        });
        
        for (const [addId, weightNeeded] of Object.entries(dryfruitsNeeded)) {
          const activeAddStocks = stocks.filter(s => s.additive_id === addId && s.deleted_at === null);
          const totalAddAvail = activeAddStocks.reduce((sum, s) => sum + s.quantity, 0);
          if (totalAddAvail < weightNeeded && !isPreOrder) {
            const addObj = additives.find(a => a.id === addId);
            throw new Error(`Insufficient stock of dryfruit ingredient "${addObj ? addObj.name : "Additive"}" for jar fillings. Required: ${weightNeeded.toFixed(2)} kg, Available: ${totalAddAvail.toFixed(2)} kg (Note: Stock levels reverted)`);
          }
        }
      } else if (item.additiveId) {
        const activeAddStocks = stocks.filter(st => st.additive_id === item.additiveId && st.deleted_at === null);
        const totalAvailable = activeAddStocks.reduce((sum, s) => sum + s.quantity, 0);
        
        if (totalAvailable < item.quantity && !isPreOrder) {
          const addObj = additives.find(a => a.id === item.additiveId);
          throw new Error(`Insufficient stock for loose dryfruit "${addObj ? addObj.name : "Dryfruit"}". Requested: ${item.quantity} kg, Available: ${totalAvailable} kg (Note: Stock levels reverted)`);
        }
      }
    }
    
    // 3. Deduct stock and save new invoice items
    let totalAmount = 0;
    const updatedItems: InvoiceItem[] = items.map((item, indexVal) => {
      const discountVal = item.discount || 0;
      const totalPrice = item.quantity * item.unitPrice * (1 - discountVal / 100);
      totalAmount += totalPrice;
      
      if (item.productId) {
        let remainingToDeduct = item.quantity;
        const activeProductStocks = stocks.filter(st => st.product_id === item.productId && st.deleted_at === null);
        
        for (const st of activeProductStocks) {
          if (remainingToDeduct <= 0) break;
          const qtyDeducted = Math.min(st.quantity, remainingToDeduct);
          st.quantity -= qtyDeducted;
          st.updated_at = new Date().toISOString();
          remainingToDeduct -= qtyDeducted;

          item.customizations?.forEach(jar => {
            if (jar.additive_id !== "empty" && jar.weight_grams > 0) {
              const weightToDeduct = (jar.weight_grams * qtyDeducted) / 1000;
              let addSt = stocks.find(s => s.additive_id === jar.additive_id && s.storage_location_id === st.storage_location_id && s.deleted_at === null);
              if (!addSt) {
                addSt = {
                  id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                  product_id: null,
                  additive_id: jar.additive_id,
                  storage_location_id: st.storage_location_id,
                  quantity: 0,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  deleted_at: null
                };
                stocks.push(addSt);
              }
              addSt.quantity -= weightToDeduct;
              addSt.updated_at = new Date().toISOString();
            }
          });
        }

        if (remainingToDeduct > 0 && isPreOrder) {
          const locations = getStorageItem<StorageLocation[]>("locations", initialLocations);
          const firstLoc = locations.find(l => l.deleted_at === null) || locations[0];
          
          if (firstLoc) {
            let activeBoxSt = activeProductStocks.find(s => s.storage_location_id === firstLoc.id);
            if (!activeBoxSt) {
              activeBoxSt = {
                id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                product_id: item.productId,
                additive_id: null,
                storage_location_id: firstLoc.id,
                quantity: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null
              };
              stocks.push(activeBoxSt);
            }
            activeBoxSt.quantity -= remainingToDeduct;
            activeBoxSt.updated_at = new Date().toISOString();

            item.customizations?.forEach(jar => {
              if (jar.additive_id !== "empty" && jar.weight_grams > 0) {
                const weightToDeduct = (jar.weight_grams * remainingToDeduct) / 1000;
                let addSt = stocks.find(s => s.additive_id === jar.additive_id && s.storage_location_id === firstLoc.id && s.deleted_at === null);
                if (!addSt) {
                  addSt = {
                    id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                    product_id: null,
                    additive_id: jar.additive_id,
                    storage_location_id: firstLoc.id,
                    quantity: 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    deleted_at: null
                  };
                  stocks.push(addSt);
                }
                addSt.quantity -= weightToDeduct;
                addSt.updated_at = new Date().toISOString();
              }
            });
          }
        }
      } else if (item.additiveId) {
        let remainingToDeduct = item.quantity;
        const activeAddStocks = stocks.filter(st => st.additive_id === item.additiveId && st.deleted_at === null);
        
        for (const st of activeAddStocks) {
          if (remainingToDeduct <= 0) break;
          const qtyDeducted = Math.min(st.quantity, remainingToDeduct);
          st.quantity -= qtyDeducted;
          st.updated_at = new Date().toISOString();
          remainingToDeduct -= qtyDeducted;
        }

        if (remainingToDeduct > 0 && isPreOrder) {
          const locations = getStorageItem<StorageLocation[]>("locations", initialLocations);
          const firstLoc = locations.find(l => l.deleted_at === null) || locations[0];
          if (firstLoc) {
            let activeAddSt = activeAddStocks.find(s => s.storage_location_id === firstLoc.id);
            if (!activeAddSt) {
              activeAddSt = {
                id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                product_id: null,
                additive_id: item.additiveId,
                storage_location_id: firstLoc.id,
                quantity: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null
              };
              stocks.push(activeAddSt);
            }
            activeAddSt.quantity -= remainingToDeduct;
            activeAddSt.updated_at = new Date().toISOString();
          }
        }
      }
      
      return {
        id: `ivi-${Date.now()}-${indexVal}-${Math.random().toString(36).substring(2, 7)}`,
        invoice_id: id,
        product_id: item.productId,
        additive_id: item.additiveId || null,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount: discountVal,
        total_price: totalPrice,
        customizations: item.customizations,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      };
    });
    
    // 4. Update the invoices and invoice_items storage
    invoices[idx].customer_name = customerName;
    invoices[idx].customer_phone = customerPhone || undefined;
    invoices[idx].total_amount = totalAmount;
    invoices[idx].status = status;
    invoices[idx].delivery_date = deliveryDate || undefined;
    invoices[idx].advance_paid = advancePaid !== undefined ? Number(advancePaid) : undefined;
    invoices[idx].payment_mode = paymentMode || "Cash";
    invoices[idx].updated_at = new Date().toISOString();
    
    const cleanedItems = invoiceItems.filter(ivi => ivi.invoice_id !== id);
    cleanedItems.push(...updatedItems);
    
    setStorageItem("invoices", invoices);
    setStorageItem("invoice_items", cleanedItems);
    setStorageItem("stock", stocks);
    
    return {
      ...invoices[idx],
      items: updatedItems
    };
  }

  getAdditives(): Additive[] {
    const list = getStorageItem<Additive[]>("additives", initialAdditives).filter(a => a.deleted_at === null);
    const stocks = getStorageItem<Stock[]>("stock", initialStock);
    return list.map(a => {
      const activeStocks = stocks.filter(st => st.additive_id === a.id && st.deleted_at === null);
      const totalStock = activeStocks.reduce((sum, s) => sum + s.quantity, 0);
      return {
        ...a,
        stock_qty_kg: totalStock
      };
    });
  }

  addAdditive(name: string, pricePerKg: number, stockQtyKg: number = 0): Additive {
    const list = getStorageItem<Additive[]>("additives", initialAdditives);
    const nameLower = name.trim().toLowerCase();
    const exists = list.some(a => a.name.toLowerCase() === nameLower && a.deleted_at === null);
    if (exists) throw new Error(`Additive "${name.trim()}" already exists.`);

    const newItem: Additive = {
      id: `add-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      price_per_kg: Number(pricePerKg),
      stock_qty_kg: Number(stockQtyKg),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
    list.push(newItem);
    setStorageItem("additives", list);

    if (stockQtyKg > 0) {
      const stocks = getStorageItem<Stock[]>("stock", initialStock);
      const locations = getStorageItem<StorageLocation[]>("locations", initialLocations);
      const firstLoc = locations.find(l => l.deleted_at === null) || locations[0];
      if (firstLoc) {
        stocks.push({
          id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          product_id: null,
          additive_id: newItem.id,
          storage_location_id: firstLoc.id,
          quantity: Number(stockQtyKg),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null
        });
        setStorageItem("stock", stocks);
      }
    }
    return newItem;
  }

  updateAdditive(id: string, name: string, pricePerKg: number, stockQtyKg: number): Additive | null {
    const list = getStorageItem<Additive[]>("additives", initialAdditives);
    const nameLower = name.trim().toLowerCase();
    const exists = list.some(a => a.id !== id && a.name.toLowerCase() === nameLower && a.deleted_at === null);
    if (exists) throw new Error(`Additive "${name.trim()}" already exists.`);

    const idx = list.findIndex(a => a.id === id);
    if (idx >= 0) {
      list[idx].name = name.trim();
      list[idx].price_per_kg = Number(pricePerKg);
      list[idx].stock_qty_kg = Number(stockQtyKg);
      list[idx].updated_at = new Date().toISOString();
      setStorageItem("additives", list);
      return list[idx];
    }
    return null;
  }

  getDamagedStock(): DamagedStock[] {
    return getStorageItem<DamagedStock[]>("damaged_stock", initialDamagedStock).filter(d => d.deleted_at === null);
  }

  addDamagedStock(productId: string | null, locationId: string, quantity: number, additiveId: string | null = null): DamagedStock {
    const stocks = getStorageItem<Stock[]>("stock", initialStock);
    const stIndex = stocks.findIndex(
      s => s.product_id === productId && 
           s.additive_id === additiveId && 
           s.storage_location_id === locationId && 
           s.deleted_at === null
    );
    
    if (stIndex < 0 || stocks[stIndex].quantity < quantity) {
      const available = stIndex >= 0 ? stocks[stIndex].quantity : 0;
      throw new Error(`Insufficient stock to mark as damaged. Requested: ${quantity}, Available: ${available}`);
    }

    stocks[stIndex].quantity -= quantity;
    stocks[stIndex].updated_at = new Date().toISOString();
    setStorageItem("stock", stocks);

    const list = getStorageItem<DamagedStock[]>("damaged_stock", initialDamagedStock);
    const newItem: DamagedStock = {
      id: `dmg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      product_id: productId,
      additive_id: additiveId,
      storage_location_id: locationId,
      quantity,
      reported_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
    list.push(newItem);
    setStorageItem("damaged_stock", list);
    return newItem;
  }

  clearAll(): void {
    if (typeof window === "undefined") return;
    setStorageItem("categories", []);
    setStorageItem("sub_types", []);
    setStorageItem("locations", []);
    setStorageItem("products", []);
    setStorageItem("stock", []);
    setStorageItem("invoices", []);
    setStorageItem("invoice_items", []);
    setStorageItem("additives", []);
    setStorageItem("damaged_stock", []);
  }

  getSellerSettings(): SellerSettings {
    const defaultSettings: SellerSettings = {
      seller_name: "Jenny's Creation",
      seller_address: "123 Creative Street, Studio City",
      gstin: "24AAACJ1234A1Z5",
      pan: "ABCDE1234F",
      show_gst_pan: false
    };
    return getStorageItem<SellerSettings>("seller_settings", defaultSettings);
  }

  saveSellerSettings(settings: SellerSettings): void {
    setStorageItem("seller_settings", settings);
  }

  resetSeed(): void {
    if (typeof window === "undefined") return;
    setStorageItem("categories", initialCategories);
    setStorageItem("sub_types", initialSubTypes);
    setStorageItem("locations", initialLocations);
    setStorageItem("products", initialProducts);
    setStorageItem("stock", initialStock);
    setStorageItem("invoices", initialInvoices);
    setStorageItem("invoice_items", initialInvoiceItems);
    setStorageItem("additives", initialAdditives);
    setStorageItem("damaged_stock", initialDamagedStock);
  }
}

export const localDB = new LocalDB();
