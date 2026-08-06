import sqlite3
import json
from datetime import datetime

def run_verification():
    print("=== STARTING LOCAL DATABASE SCHEMA VERIFICATION ===")
    
    # 1. Initialize in-memory SQLite database
    conn = sqlite3.connect(":memory:")
    cursor = conn.cursor()
    
    # 2. Create tables mimicking our PostgreSQL schema (adapted for SQLite syntax)
    cursor.execute("""
    CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        deleted_at TEXT
    );
    """)
    
    cursor.execute("""
    CREATE TABLE sub_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        deleted_at TEXT,
        UNIQUE (category_id, name)
    );
    """)
    
    cursor.execute("""
    CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        sub_type_id INTEGER REFERENCES sub_types(id),
        photos TEXT NOT NULL DEFAULT '[]', -- JSON string
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        deleted_at TEXT
    );
    """)
    
    cursor.execute("""
    CREATE TABLE storage_locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        deleted_at TEXT
    );
    """)
    
    cursor.execute("""
    CREATE TABLE stock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER REFERENCES products(id),
        storage_location_id INTEGER REFERENCES storage_locations(id),
        quantity INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
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
        issue_date TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
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
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        deleted_at TEXT
    );
    """)
    
    # 3. Seed lookup tables
    categories = ["Box", "Puttha", "Laser Cutting", "Basket"]
    for cat in categories:
        cursor.execute("INSERT INTO categories (name) VALUES (?)", (cat,))
        
    # Seed sub_types linked to categories:
    # 2 JAR linked to Box (ID: 1), 6 Box linked to Puttha (ID: 2), Peacock Design linked to Laser Cutting (ID: 3)
    sub_types = [
        ("2 JAR", 1),
        ("6 Box", 2),
        ("Peacock Design", 3)
    ]
    for sub, cat_id in sub_types:
        cursor.execute("INSERT INTO sub_types (name, category_id) VALUES (?, ?)", (sub, cat_id))
        
    locations = ["Warehouse 1", "Warehouse 2", "Warehouse 3", "Warehouse 4", "Display"]
    for loc in locations:
        cursor.execute("INSERT INTO storage_locations (name) VALUES (?)", (loc,))
        
    conn.commit()
    print("Seed data loaded successfully.")
    
    # 4. Insert 1 test item
    # Get ID of Category 'Box'
    cursor.execute("SELECT id FROM categories WHERE name = 'Box' AND deleted_at IS NULL")
    category_id = cursor.fetchone()[0]
    
    # Get ID of Sub-Type '2 JAR'
    cursor.execute("SELECT id FROM sub_types WHERE name = '2 JAR' AND deleted_at IS NULL")
    sub_type_id = cursor.fetchone()[0]
    
    # Get ID of Location 'Warehouse 1'
    cursor.execute("SELECT id FROM storage_locations WHERE name = 'Warehouse 1' AND deleted_at IS NULL")
    location_id = cursor.fetchone()[0]
    
    # Create the Product '2 JAR Gift Box'
    photos_json = json.dumps(["https://example.com/photos/2jar_box.jpg"])
    cursor.execute(
        "INSERT INTO products (name, category_id, sub_type_id, photos) VALUES (?, ?, ?, ?)",
        ("2 JAR Gift Box", category_id, sub_type_id, photos_json)
    )
    product_id = cursor.lastrowid
    print(f"Inserted Product: '2 JAR Gift Box' (ID: {product_id}, Category: Box, Sub-type: 2 JAR, Photos: {photos_json})")
    
    # Insert Stock of 10
    cursor.execute(
        "INSERT INTO stock (product_id, storage_location_id, quantity) VALUES (?, ?, ?)",
        (product_id, location_id, 10)
    )
    stock_id = cursor.lastrowid
    print(f"Inserted Stock record: Location = Warehouse 1, Quantity = 10, Stock ID: {stock_id}")
    conn.commit()
    
    # 5. Output relational query verification (Active Stock query)
    print("\n--- ACTIVE STOCK RELATIONAL QUERY RESULT ---")
    query = """
        SELECT 
            p.name AS product_name,
            c.name AS category_name,
            s.name AS subtype_name,
            l.name AS location_name,
            st.quantity,
            p.photos
        FROM stock st
        JOIN products p ON st.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        JOIN sub_types s ON p.sub_type_id = s.id
        JOIN storage_locations l ON st.storage_location_id = l.id
        WHERE st.deleted_at IS NULL
          AND p.deleted_at IS NULL
          AND c.deleted_at IS NULL
          AND s.deleted_at IS NULL
          AND l.deleted_at IS NULL
    """
    cursor.execute(query)
    rows = cursor.fetchall()
    for row in rows:
        photos = json.loads(row[5])
        print(f"Product: {row[0]}")
        print(f"Category: {row[1]}")
        print(f"Sub-type: {row[2]}")
        print(f"Location: {row[3]}")
        print(f"Quantity: {row[4]}")
        print(f"Photos: {photos}")
        
    # 6. Verify Soft Delete Capability
    print("\n--- VERIFYING SOFT DELETE CAPABILITY ---")
    # Soft delete the stock item
    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("UPDATE stock SET deleted_at = ? WHERE id = ?", (now_str, stock_id))
    conn.commit()
    print(f"Soft deleted stock record (ID: {stock_id}) by setting deleted_at = '{now_str}'")
    
    # Query active stock again
    cursor.execute(query)
    active_rows = cursor.fetchall()
    print(f"Active stock items returned: {len(active_rows)}")
    
    # Query all stock (including deleted)
    query_all = """
        SELECT st.id, p.name, st.quantity, st.deleted_at 
        FROM stock st
        JOIN products p ON st.product_id = p.id
    """
    cursor.execute(query_all)
    all_rows = cursor.fetchall()
    print("All stock items in DB (including soft-deleted):")
    for r in all_rows:
        print(f"  ID: {r[0]} | Name: {r[1]} | Qty: {r[2]} | Deleted At: {r[3]}")
        
    conn.close()
    print("\n=== VERIFICATION COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_verification()
