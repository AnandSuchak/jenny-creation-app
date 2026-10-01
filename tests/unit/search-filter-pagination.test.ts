import { describe, it, expect, beforeEach } from "vitest";
import { localDB, Product } from "@/lib/mockData";
import { createSuperAdminUser } from "../fixtures/factories";

describe("Search, Filter, and Pagination Logic Unit Tests", () => {
  const admin = createSuperAdminUser();
  let catAId: string;
  let catBId: string;

  beforeEach(() => {
    const uid = Math.random().toString(36).substring(2, 7);
    const cA = localDB.addCategory(`Traditional Boxes ${uid}`, admin);
    const cB = localDB.addCategory(`Modern Hampers ${uid}`, admin);
    catAId = cA.id;
    catBId = cB.id;

    const subA = localDB.addSubType(`2 Jar ${uid}`, catAId, admin);
    const subB = localDB.addSubType(`4 Jar ${uid}`, catBId, admin);

    // Create 15 distinct products for pagination testing
    for (let i = 1; i <= 10; i++) {
      localDB.addProduct(`Classic Box ${i}`, catAId, subA.id, [], 100 * i, `SUP-CLA-0${i}`, admin);
    }
    for (let i = 1; i <= 5; i++) {
      localDB.addProduct(`Velvet Hamper ${i}`, catBId, subB.id, [], 200 * i, `SUP-VEL-0${i}`, admin);
    }
  });

  const getScopedProducts = () => localDB.getProducts().filter(p => p.category_id === catAId || p.category_id === catBId);

  it("filters products by partial, case-insensitive name search query", () => {
    const all = getScopedProducts();
    const query = "classic box";

    const filtered = all.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (p.supplier_code && p.supplier_code.toLowerCase().includes(query.toLowerCase()))
    );

    expect(filtered).toHaveLength(10);
  });

  it("filters products by supplier code accurately", () => {
    const all = getScopedProducts();
    const query = "SUP-VEL-03";

    const filtered = all.filter(p =>
      p.supplier_code?.toLowerCase().includes(query.toLowerCase())
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe("Velvet Hamper 3");
  });

  it("filters products by category accurately", () => {
    const all = getScopedProducts();
    const filteredA = all.filter(p => p.category_id === catAId);
    const filteredB = all.filter(p => p.category_id === catBId);

    expect(filteredA).toHaveLength(10);
    expect(filteredB).toHaveLength(5);
  });

  it("combines category filter and text search", () => {
    const all = getScopedProducts();
    const filtered = all.filter(p =>
      p.category_id === catAId && p.name.toLowerCase().includes("box 5")
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe("Classic Box 5");
  });

  it("paginates products into correct slices and page counts", () => {
    const all = getScopedProducts();
    const perPage = 6;
    const totalPages = Math.ceil(all.length / perPage);

    expect(totalPages).toBe(3); // 15 items / 6 = 3 pages (6, 6, 3)

    const page1 = all.slice(0, 6);
    const page2 = all.slice(6, 12);
    const page3 = all.slice(12, 18);

    expect(page1).toHaveLength(6);
    expect(page2).toHaveLength(6);
    expect(page3).toHaveLength(3);
  });

  it("REGRESSION TEST (BUG-009): documents empty page issue when query shrinks result on higher page", () => {
    const all = getScopedProducts();
    const perPage = 6;

    // Simulate user browsing on page 3
    let currentPage = 3;

    // User types search query that returns only 2 items
    const query = "Velvet Hamper 1";
    const filtered = all.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    expect(filtered).toHaveLength(1);

    // If currentPage is not reset to 1:
    const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
    // (3 - 1) * 6 = 12. filtered has 1 item, so slice(12, 18) is EMPTY!
    expect(paginated).toHaveLength(0);
  });
});
