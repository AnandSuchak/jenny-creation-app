import sqlite3
import time
from datetime import datetime, UTC

def test_category_crud():
    print("==================================================")
    print("    RUNNING CATEGORY CRUD DATABASE TEST CASE      ")
    print("==================================================")
    
    # 1. Initialize SQLite database
    conn = sqlite3.connect(":memory:")
    cursor = conn.cursor()
    
    # Create the Categories table (mirroring schema.sql)
    cursor.execute("""
    CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now')),
        deleted_at TEXT
    );
    """)
    conn.commit()
    print("[PASS] Initialize Database & Table: 'categories'")

    # ==========================================
    # 2. TEST CASE: CREATE
    # ==========================================
    category_name = "Box"
    cursor.execute("INSERT INTO categories (name) VALUES (?)", (category_name,))
    category_id = cursor.lastrowid
    conn.commit()
    
    assert category_id is not None, "Error: Created category ID should not be None."
    print(f"[PASS] CREATE: Created Category '{category_name}' with ID: {category_id}")

    # ==========================================
    # 3. TEST CASE: READ
    # ==========================================
    cursor.execute("SELECT id, name, created_at, updated_at, deleted_at FROM categories WHERE id = ?", (category_id,))
    row = cursor.fetchone()
    
    assert row is not None, "Error: Category could not be read."
    assert row[1] == category_name, f"Error: Category name mismatch. Expected '{category_name}', got '{row[1]}'"
    assert row[4] is None, "Error: Category deleted_at should be NULL after creation."
    
    created_at_time = row[2]
    updated_at_time = row[3]
    print(f"[PASS] READ: Retrieved Category: ID={row[0]}, Name='{row[1]}', CreatedAt='{row[2]}', DeletedAt={row[4]}")

    # Sleep a tiny bit to guarantee updated_at changes
    time.sleep(0.1)

    # ==========================================
    # 4. TEST CASE: UPDATE
    # ==========================================
    new_category_name = "Gift Box"
    current_time = datetime.now(UTC).strftime("%Y-%m-%d %H:%M:%S.%f")
    
    cursor.execute(
        "UPDATE categories SET name = ?, updated_at = ? WHERE id = ?",
        (new_category_name, current_time, category_id)
    )
    conn.commit()
    
    # Read back to verify update
    cursor.execute("SELECT name, updated_at FROM categories WHERE id = ?", (category_id,))
    updated_row = cursor.fetchone()
    
    assert updated_row[0] == new_category_name, f"Error: Name was not updated. Expected '{new_category_name}', got '{updated_row[0]}'"
    assert updated_row[1] != updated_at_time, "Error: updated_at was not modified."
    print(f"[PASS] UPDATE: Renamed '{category_name}' -> '{updated_row[0]}'")
    print(f"       Before updated_at: {updated_at_time}")
    print(f"       After updated_at:  {updated_row[1]}")

    # ==========================================
    # 5. TEST CASE: SOFT DELETE
    # ==========================================
    delete_time = datetime.now(UTC).strftime("%Y-%m-%d %H:%M:%S.%f")
    cursor.execute(
        "UPDATE categories SET deleted_at = ? WHERE id = ?",
        (delete_time, category_id)
    )
    conn.commit()
    print(f"[PASS] SOFT DELETE: Marked Category (ID: {category_id}) as deleted_at = '{delete_time}'")

    # A: Verify active queries (deleted_at IS NULL) return 0 records
    cursor.execute("SELECT id, name FROM categories WHERE deleted_at IS NULL")
    active_records = cursor.fetchall()
    
    assert len(active_records) == 0, f"Error: Active records should be 0. Got {len(active_records)}"
    print(f"[PASS] VERIFICATION (ACTIVE): Active category queries successfully returned 0 records.")

    # B: Verify raw table contains the soft deleted record
    cursor.execute("SELECT id, name, deleted_at FROM categories")
    raw_records = cursor.fetchall()
    
    assert len(raw_records) == 1, f"Error: Raw table should contain the record. Got {len(raw_records)}"
    assert raw_records[0][2] == delete_time, f"Error: deleted_at mismatch."
    print(f"[PASS] VERIFICATION (HISTORICAL): Historical query successfully returned soft-deleted record.")
    print(f"       Category ID: {raw_records[0][0]} | Name: '{raw_records[0][1]}' | Deleted At: '{raw_records[0][2]}'")

    conn.close()
    print("==================================================")
    print("      ALL CRUD TEST CASES PASSED SUCCESSFULLY     ")
    print("==================================================")

if __name__ == "__main__":
    test_category_crud()
