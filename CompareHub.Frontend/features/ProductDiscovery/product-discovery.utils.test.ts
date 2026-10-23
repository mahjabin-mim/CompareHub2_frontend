import { describe, expect, it } from "vitest";
import { StoreProductResult } from "./product-discovery.types";
import { filterByStore, getRelevance, sortProducts } from "./product-discovery.utils";

const product = (productName: string, price: number, storeKey = "kireibd.com"): StoreProductResult => ({
    productName,
    price,
    productUrl: `https://${storeKey}/${encodeURIComponent(productName)}`,
    imageUrl: "",
    sourceWebsite: storeKey,
    storeKey
});

describe("getRelevance", () => {
    it("returns the share of query words found in the name", () => {
        expect(getRelevance("COSRX Vitamin C Serum 20ml", "vitamin c serum")).toBe(1);
        expect(getRelevance("Garnier Vitamin C Face Wash", "vitamin c serum")).toBe(0.5);
    });

    it("treats an empty query as fully relevant", () => {
        expect(getRelevance("Anything", "  ")).toBe(1);
    });
});

describe("sortProducts", () => {
    const products = [
        product("Vitamin C Face Wash", 300),
        product("Vitamin C Serum", 900),
        product("Vitamin C Serum Mini", 450)
    ];

    it("orders best match by relevance, then by lowest price", () => {
        expect(sortProducts(products, "best-match", "vitamin c serum").map((x) => x.price)).toEqual([450, 900, 300]);
    });

    it("orders by price in both directions without mutating the input", () => {
        expect(sortProducts(products, "price-asc", "").map((x) => x.price)).toEqual([300, 450, 900]);
        expect(sortProducts(products, "price-desc", "").map((x) => x.price)).toEqual([900, 450, 300]);
        expect(products.map((x) => x.price)).toEqual([300, 900, 450]);
    });
});

describe("filterByStore", () => {
    it("keeps only the selected store, or everything when none is selected", () => {
        const products = [product("A", 100, "kireibd.com"), product("B", 200, "arogga.com")];

        expect(filterByStore(products, "arogga.com").map((x) => x.productName)).toEqual(["B"]);
        expect(filterByStore(products, null)).toHaveLength(2);
    });
});
