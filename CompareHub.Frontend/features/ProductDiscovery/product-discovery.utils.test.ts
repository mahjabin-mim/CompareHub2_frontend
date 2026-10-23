import { describe, expect, it } from "vitest";
import { ProductGroup } from "./product-discovery.grouping";
import { filterGroupsByStore, getRelevance, sortGroups } from "./product-discovery.utils";

const group = (name: string, prices: Record<string, number>): ProductGroup => {
    const offers = Object.entries(prices)
        .map(([storeKey, price]) => ({
            productName: name,
            price,
            productUrl: `https://${storeKey}/${encodeURIComponent(name)}`,
            imageUrl: "",
            sourceWebsite: storeKey,
            storeKey
        }))
        .sort((a, b) => a.price - b.price);
    return {
        key: name,
        name,
        imageUrls: [],
        offers,
        lowestPrice: offers[0].price,
        highestPrice: offers[offers.length - 1].price,
        storeCount: offers.length
    };
};

describe("getRelevance", () => {
    it("returns the share of query words found in the name", () => {
        expect(getRelevance("COSRX Vitamin C Serum 20ml", "vitamin c serum")).toBe(1);
        expect(getRelevance("Garnier Vitamin C Face Wash", "vitamin c serum")).toBe(0.5);
    });

    it("treats an empty query as fully relevant", () => {
        expect(getRelevance("Anything", "  ")).toBe(1);
    });
});

describe("sortGroups", () => {
    const groups = [
        group("Vitamin C Face Wash", { "kireibd.com": 300 }),
        group("Vitamin C Serum", { "kireibd.com": 900, "arogga.com": 950 }),
        group("Vitamin C Serum Mini", { "kireibd.com": 450 })
    ];

    it("orders best match by relevance, then by number of stores, then by lowest price", () => {
        expect(sortGroups(groups, "best-match", "vitamin c serum").map((x) => x.name)).toEqual([
            "Vitamin C Serum",
            "Vitamin C Serum Mini",
            "Vitamin C Face Wash"
        ]);
    });

    it("orders by lowest price in both directions without mutating the input", () => {
        expect(sortGroups(groups, "price-asc", "").map((x) => x.lowestPrice)).toEqual([300, 450, 900]);
        expect(sortGroups(groups, "price-desc", "").map((x) => x.lowestPrice)).toEqual([900, 450, 300]);
        expect(groups.map((x) => x.lowestPrice)).toEqual([300, 900, 450]);
    });

    it("orders by number of stores", () => {
        expect(sortGroups(groups, "most-stores", "")[0].name).toBe("Vitamin C Serum");
    });
});

describe("filterGroupsByStore", () => {
    it("keeps products sold by the selected store, or everything when none is selected", () => {
        const groups = [group("A", { "kireibd.com": 100 }), group("B", { "arogga.com": 200, "kireibd.com": 210 })];

        expect(filterGroupsByStore(groups, "arogga.com").map((x) => x.name)).toEqual(["B"]);
        expect(filterGroupsByStore(groups, "kireibd.com")).toHaveLength(2);
        expect(filterGroupsByStore(groups, null)).toHaveLength(2);
    });
});
