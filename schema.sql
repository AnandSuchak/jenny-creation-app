-- PostgreSQL Schema for Supabase (JENNY CREATION)
-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (For RBAC operator accounts)
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    rights JSONB NOT NULL DEFAULT '{"view_stock": true, "generate_bill": true, "edit_inventory": false}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE, -- For soft deletes
    require_password_change BOOLEAN DEFAULT false,
    current_session_token VARCHAR(255) -- Single-session lock token
);

-- 2. CATEGORIES TABLE
CREATE TABLE categories (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE -- For soft deletes
);

-- 3. SUB-TYPES TABLE
CREATE TABLE sub_types (
    id VARCHAR(255) PRIMARY KEY,
    category_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE -- For soft deletes
);

-- 4. PRODUCTS TABLE
CREATE TABLE products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id VARCHAR(255) REFERENCES categories(id) ON DELETE RESTRICT,
    sub_type_id VARCHAR(255) REFERENCES sub_types(id) ON DELETE RESTRICT,
    photos JSONB DEFAULT '[]'::jsonb NOT NULL, -- Array of photo URLs/metadata
    price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL, -- Selling price
    supplier_code VARCHAR(255), -- Supplier code (optional)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE -- For soft deletes
);

-- 5. STORAGE LOCATIONS TABLE
CREATE TABLE storage_locations (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE -- For soft deletes
);

-- 6. STOCK TABLE (Physical counts per product per location)
CREATE TABLE stock (
    id VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
    storage_location_id VARCHAR(255) REFERENCES storage_locations(id) ON DELETE RESTRICT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE -- For soft deletes
);

-- 7. ADDITIVES TABLE (Dry fruit stock items)
CREATE TABLE additives (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price_per_kg NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    stock_qty_kg NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE -- For soft deletes
);

-- 8. DAMAGED STOCK TABLE
CREATE TABLE damaged_stock (
    id VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) REFERENCES products(id) ON DELETE RESTRICT,
    additive_id VARCHAR(255) REFERENCES additives(id) ON DELETE RESTRICT,
    storage_location_id VARCHAR(255) REFERENCES storage_locations(id) ON DELETE RESTRICT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    qty_kg NUMERIC(12, 2) DEFAULT 0.00,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE -- For soft deletes
);

-- 9. INVOICES TABLE (Includes creator and device fingerprinting details)
CREATE TABLE invoices (
    id VARCHAR(255) PRIMARY KEY,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'ordered' NOT NULL, -- ordered, preparing, completed, delivered
    delivery_date VARCHAR(100),
    advance_paid NUMERIC(12, 2) DEFAULT 0.00,
    payment_mode VARCHAR(50) DEFAULT 'cash',
    created_by_user_id VARCHAR(255) REFERENCES users(id),
    created_by_username VARCHAR(255),
    device_ip VARCHAR(100),
    device_fingerprint VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE -- For soft deletes
);

-- 10. INVOICE ITEMS TABLE (Includes dry fruit additives and customizations jsonb)
CREATE TABLE invoice_items (
    id VARCHAR(255) PRIMARY KEY,
    invoice_id VARCHAR(255) REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
    product_id VARCHAR(255) REFERENCES products(id) ON DELETE RESTRICT,
    additive_id VARCHAR(255) REFERENCES additives(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(5, 2) DEFAULT 0.00 NOT NULL, -- Discount percentage
    customizations JSONB DEFAULT '[]'::jsonb, -- Array of JarCustomization details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE -- For soft deletes
);

-- Indexes for performance and quick lookups
CREATE INDEX idx_products_category ON products(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_subtype ON products(sub_type_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_subtypes_category ON sub_types(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_stock_product ON stock(product_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_stock_location ON stock(storage_location_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoice_items_product ON invoice_items(product_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoice_items_additive ON invoice_items(additive_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_damaged_stock_product ON damaged_stock(product_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_damaged_stock_additive ON damaged_stock(additive_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_damaged_stock_location ON damaged_stock(storage_location_id) WHERE deleted_at IS NULL;
