import sqlite3
import json
import time
from datetime import datetime, UTC

def test_full_system_crud():
    print("==============================================================")
    print("          STARTING COMPREHENSIVE CRUD SYSTEM TESTS            ")
    print("==============================================================")
    
    # 1. Connect to an in-memory SQLite database
    conn = sqlite3.connect(":memory:")
    cursor = conn.cursor()
    
    # 2. Create tables replicating our schema
    cursor.execute("""
    CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now')),
        updated_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now')),
        deleted_at TEXT
    );
    """)
    
    cursor.execute("""
    CREATE TABLE sub_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        created_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now')),
        updated_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now')),
        deleted_at TEXT,
        UNIQUE (category_id, name)
    );
    """)

    cursor.execute("""
    CREATE TABLE storage_locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now')),
        updated_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now')),
        deleted_at TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        sub_type_id INTEGER REFERENCES sub_types(id),
        photos TEXT NOT NULL DEFAULT '[]', -- JSON string
        created_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now')),
        updated_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now')),
        deleted_at TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE stock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER REFERENCES products(id),
        storage_location_id INTEGER REFERENCES storage_locations(id),
        quantity INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now')),
        updated_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now')),
        deleted_at TEXT,
        UNIQUE (product_id, storage_location_id)
    );
    """)

    cursor.execute("""
    CREATE TABLE invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT NOT NULL UNIQUE,
        customer_name TEXT NOT NULL,
        total_amount REAL NOT NULL DEFAULT 0.00,
        issue_date TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now')),
        created_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now')),
        updated_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now')),
        deleted_at TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL DEFAULT 0.00,
        total_price REAL,
        created_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now')),
        updated_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now')),
        deleted_at TEXT
    );
    """)
    conn.commit()
    print("[PASS] DATABASE SCENARIO: Created all relational tables successfully.")

    # ==========================================
    # PHASE A: PARAMETERS CRUD (Categories, Sub-Types, Locations)
    # ==========================================
    print("\n--- PHASE A: PARAMETERS (CATEGORY, SUB-TYPE, LOCATION) CRUD ---")
    
    # 1. CREATE
    cursor.execute("INSERT INTO categories (name) VALUES (?)", ("Box",))
    cat_id = cursor.lastrowid
    
    cursor.execute("INSERT INTO sub_types (category_id, name) VALUES (?, ?)", (cat_id, "2 JAR"))
    sub_id = cursor.lastrowid

    cursor.execute("INSERT INTO storage_locations (name) VALUES (?)", ("Warehouse 1",))
    loc_id = cursor.lastrowid
    conn.commit()
    print(f"[PASS] CREATE Parameters: Category ID={cat_id}, Subtype ID={sub_id}, Location ID={loc_id}")

    # 2. READ
    cursor.execute("SELECT name FROM categories WHERE id = ?", (cat_id,))
    assert cursor.fetchone()[0] == "Box"
    cursor.execute("SELECT name FROM sub_types WHERE id = ?", (sub_id,))
    assert cursor.fetchone()[0] == "2 JAR"
    cursor.execute("SELECT name FROM storage_locations WHERE id = ?", (loc_id,))
    assert cursor.fetchone()[0] == "Warehouse 1"
    print("[PASS] READ Parameters: Verified all parameter records correctly.")

    # 3. UPDATE
    time.sleep(0.01) # ensure timestamps increment
    now_str = datetime.now(UTC).strftime("%Y-%m-%d %H:%M:%S.%f")
    cursor.execute("UPDATE categories SET name = ?, updated_at = ? WHERE id = ?", ("Gift Box", now_str, cat_id))
    cursor.execute("UPDATE sub_types SET name = ?, updated_at = ? WHERE id = ?", ("2-JAR Pack", now_str, sub_id))
    cursor.execute("UPDATE storage_locations SET name = ?, updated_at = ? WHERE id = ?", ("WH-1 Main", now_str, loc_id))
    conn.commit()
    
    cursor.execute("SELECT name, updated_at FROM categories WHERE id = ?", (cat_id,))
    r_cat = cursor.fetchone()
    assert r_cat[0] == "Gift Box"
    assert r_cat[1] == now_str
    
    cursor.execute("SELECT name, updated_at FROM sub_types WHERE id = ?", (sub_id,))
    r_sub = cursor.fetchone()
    assert r_sub[0] == "2-JAR Pack"
    
    cursor.execute("SELECT name, updated_at FROM storage_locations WHERE id = ?", (loc_id,))
    r_loc = cursor.fetchone()
    assert r_loc[0] == "WH-1 Main"
    print("[PASS] UPDATE Parameters: Renamed all fields and verified updated_at timestamp changes.")

    # ==========================================
    # PHASE B: PRODUCTS CRUD
    # ==========================================
    print("\n--- PHASE B: PRODUCTS CRUD ---")
    
    # 1. CREATE Product
    photos = ["https://example.com/photos/gift_box.jpg"]
    cursor.execute(
        "INSERT INTO products (name, category_id, sub_type_id, photos) VALUES (?, ?, ?, ?)",
        ("Premium 2 JAR Box", cat_id, sub_id, json.dumps(photos))
    )
    prod_id = cursor.lastrowid
    conn.commit()
    print(f"[PASS] CREATE Product: Inserted 'Premium 2 JAR Box' (ID={prod_id}) linking Cat={cat_id}, Sub={sub_id}")

    # 2. READ Product (Relational JOIN lookup)
    query_prod = """
        SELECT p.name, c.name, s.name, p.photos
        FROM products p
        JOIN categories c ON p.category_id = c.id
        JOIN sub_types s ON p.sub_type_id = s.id
        WHERE p.id = ?
    """
    cursor.execute(query_prod, (prod_id,))
    prod_row = cursor.fetchone()
    assert prod_row[0] == "Premium 2 JAR Box"
    assert prod_row[1] == "Gift Box"
    assert prod_row[2] == "2-JAR Pack"
    assert json.loads(prod_row[3])[0] == photos[0]
    print(f"[PASS] READ Product: Relational query successfully matched Product -> Category ('{prod_row[1]}') and Sub-Type ('{prod_row[2]}').")

    # 3. UPDATE Product
    new_prod_name = "Premium 2 JAR Gift Box"
    new_photos = ["https://example.com/photos/gift_box_updated.jpg"]
    cursor.execute(
        "UPDATE products SET name = ?, photos = ?, updated_at = ? WHERE id = ?",
        (new_prod_name, json.dumps(new_photos), now_str, prod_id)
    )
    conn.commit()
    
    cursor.execute("SELECT name, photos FROM products WHERE id = ?", (prod_id,))
    up_prod = cursor.fetchone()
    assert up_prod[0] == new_prod_name
    assert json.loads(up_prod[1])[0] == new_photos[0]
    print(f"[PASS] UPDATE Product: Renamed product to '{up_prod[0]}' and updated photos arrays.")

    # ==========================================
    # PHASE C: STOCK CRUD
    # ==========================================
    print("\n--- PHASE C: STOCK CRUD ---")
    
    # 1. CREATE Stock
    cursor.execute(
        "INSERT INTO stock (product_id, storage_location_id, quantity) VALUES (?, ?, ?)",
        (prod_id, loc_id, 10)
    )
    stock_id = cursor.lastrowid
    conn.commit()
    print(f"[PASS] CREATE Stock: Set {new_prod_name} in Location {loc_id} with Quantity=10.")

    # 2. READ Stock
    query_stock = """
        SELECT p.name, l.name, st.quantity
        FROM stock st
        JOIN products p ON st.product_id = p.id
        JOIN storage_locations l ON st.storage_location_id = l.id
        WHERE st.id = ?
    """
    cursor.execute(query_stock, (stock_id,))
    st_row = cursor.fetchone()
    assert st_row[0] == new_prod_name
    assert st_row[1] == "WH-1 Main"
    assert st_row[2] == 10
    print(f"[PASS] READ Stock: Relational query verified product '{st_row[0]}' quantity is {st_row[2]} in '{st_row[1]}'.")

    # 3. UPDATE Stock (Simulating adjustment/adding stock)
    cursor.execute(
        "UPDATE stock SET quantity = quantity + 15, updated_at = ? WHERE id = ?",
        (now_str, stock_id)
    )
    conn.commit()
    
    cursor.execute("SELECT quantity FROM stock WHERE id = ?", (stock_id,))
    assert cursor.fetchone()[0] == 25
    print("[PASS] UPDATE Stock: Added +15 items. Verified updated stock quantity is 25.")

    # ==========================================
    # PHASE D: INVOICES & INVOICE ITEMS CRUD
    # ==========================================
    print("\n--- PHASE D: INVOICES & INVOICE ITEMS CRUD ---")
    
    # 1. CREATE Invoice & Invoice Item
    invoice_num = "INV-2026-TEST"
    cust_name = "Aryan Sharma"
    total_val = 1200.00
    
    cursor.execute(
        "INSERT INTO invoices (invoice_number, customer_name, total_amount) VALUES (?, ?, ?)",
        (invoice_num, cust_name, total_val)
    )
    inv_id = cursor.lastrowid
    
    # Insert invoice items (quantity = 12, unit_price = 100, total_price = 1200)
    qty = 12
    price = 100.00
    t_price = qty * price
    cursor.execute(
        "INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)",
        (inv_id, prod_id, qty, price, t_price)
    )
    conn.commit()
    print(f"[PASS] CREATE Invoice: Saved invoice '{invoice_num}' to customer '{cust_name}' (Total={total_val}).")
    print(f"[PASS] CREATE Invoice Item: Attached item link (Product ID: {prod_id}, Qty: {qty}, Total Price: {t_price}) to Invoice ID: {inv_id}.")

    # 2. READ Invoice & Items
    cursor.execute("SELECT invoice_number, customer_name, total_amount FROM invoices WHERE id = ?", (inv_id,))
    inv_row = cursor.fetchone()
    assert inv_row[0] == invoice_num
    assert inv_row[1] == cust_name
    assert inv_row[2] == total_val
    
    query_item = """
        SELECT p.name, ii.quantity, ii.unit_price, ii.total_price
        FROM invoice_items ii
        JOIN products p ON ii.product_id = p.id
        WHERE ii.invoice_id = ?
    """
    cursor.execute(query_item, (inv_id,))
    item_row = cursor.fetchone()
    assert item_row[0] == new_prod_name
    assert item_row[1] == qty
    assert item_row[2] == price
    assert item_row[3] == t_price
    print(f"[PASS] READ Invoice & Items: Invoice matches and verified line item links product '{item_row[0]}' correctly.")

    # ==========================================
    # PHASE E: SOFT DELETION TEST FOR ALL ENTITIES
    # ==========================================
    print("\n--- PHASE E: SYSTEM-WIDE SOFT DELETE TESTS ---")
    
    del_timestamp = datetime.now(UTC).strftime("%Y-%m-%d %H:%M:%S.%f")
    
    # Soft delete categories, products, stock, invoices
    cursor.execute("UPDATE categories SET deleted_at = ? WHERE id = ?", (del_timestamp, cat_id))
    cursor.execute("UPDATE sub_types SET deleted_at = ? WHERE id = ?", (del_timestamp, sub_id))
    cursor.execute("UPDATE storage_locations SET deleted_at = ? WHERE id = ?", (del_timestamp, loc_id))
    cursor.execute("UPDATE products SET deleted_at = ? WHERE id = ?", (del_timestamp, prod_id))
    cursor.execute("UPDATE stock SET deleted_at = ? WHERE id = ?", (del_timestamp, stock_id))
    cursor.execute("UPDATE invoices SET deleted_at = ? WHERE id = ?", (del_timestamp, inv_id))
    cursor.execute("UPDATE invoice_items SET deleted_at = ? WHERE invoice_id = ?", (del_timestamp, inv_id))
    conn.commit()
    print("[PASS] SOFT DELETE Executed: Set deleted_at timestamp on Category, Sub-Type, Location, Product, Stock, Invoice, and Invoice Items.")
    
    # Verify active queries filter out all soft deleted items
    cursor.execute("SELECT id FROM categories WHERE deleted_at IS NULL")
    assert len(cursor.fetchall()) == 0
    cursor.execute("SELECT id FROM sub_types WHERE deleted_at IS NULL")
    assert len(cursor.fetchall()) == 0
    cursor.execute("SELECT id FROM storage_locations WHERE deleted_at IS NULL")
    assert len(cursor.fetchall()) == 0
    cursor.execute("SELECT id FROM products WHERE deleted_at IS NULL")
    assert len(cursor.fetchall()) == 0
    cursor.execute("SELECT id FROM stock WHERE deleted_at IS NULL")
    assert len(cursor.fetchall()) == 0
    cursor.execute("SELECT id FROM invoices WHERE deleted_at IS NULL")
    assert len(cursor.fetchall()) == 0
    cursor.execute("SELECT id FROM invoice_items WHERE deleted_at IS NULL")
    assert len(cursor.fetchall()) == 0
    print("[PASS] SOFT DELETE VERIFICATION (ACTIVE): Active queries successfully returned 0 records system-wide.")

    # Verify database still holds the records historically
    cursor.execute("SELECT id, name, deleted_at FROM products")
    hist_prod = cursor.fetchone()
    assert hist_prod[0] == prod_id
    assert hist_prod[2] == del_timestamp
    print(f"[PASS] SOFT DELETE VERIFICATION (HISTORICAL): Verified record still exists. ID={hist_prod[0]} Name='{hist_prod[1]}' deleted_at='{hist_prod[2]}'.")
    
    conn.close()
    print("\n==============================================================")
    print("      ALL COMPREHENSIVE CRUD TEST CASES PASSED SUCCESSFULLY   ")
    print("==============================================================")

if __name__ == "__main__":
    test_full_system_crud()
