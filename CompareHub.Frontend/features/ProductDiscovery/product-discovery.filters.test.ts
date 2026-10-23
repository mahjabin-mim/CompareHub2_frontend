import { describe, expect, it } from "vitest";
import { ProductGroup } from "./product-discovery.grouping";
import {
    filterGroupsByBrand,
    filterGroupsByPrice,
    getBrand,
    getBrandOptions,
    parsePriceInput
} from "./product-discovery.filters";

const group = (name: string, prices: number[]): ProductGroup => ({
    key: name,
    name,
    imageUrls: [],
    offers: prices.map((price, index) => ({
        productName: name,
        price,
        productUrl: `https://store${index}.example/${encodeURIComponent(name)}`,
        imageUrl: "",
        sourceWebsite: `store${index}.example`,
        storeKey: `store${index}.example`
    })),
    lowestPrice: Math.min(...prices),
    highestPrice: Math.max(...prices),
    storeCount: prices.length
});

describe("getBrand", () => {
    it.each([
        ["Cosrx Advanced Snail 96 Mucin Power Essence 30ml", "COSRX"],
        ["Dot & Key Mango Detan Gel Sunscreen SPF 50+ PA+++ 50g", "Dot & Key"],
        ["DOT AND KEY Vitamin C Serum", "Dot & Key"],
        ["The Derma Co. 1% Hyaluronic Sunscreen Aqua Gel", "The Derma Co"],
        ["NINELESS B Boost 10% Niacinamide Serum 30ml", "Nineless"],
        ["Nine Less B-Boost Serum", "Nineless"],
        ["I’m from – Rice Whip Facial Cleanser 150ml", "I'm From"],
        ["(NO OUTERBOX) I’M FROM – Rice Whip Facial Cleanser 150ml", "I'm From"],
        ["Estée Lauder Nutritious 2-in-1 Foam Face Cleanser", "Estée Lauder"],
        ["Dr. Sheth's Haldi & Hyaluronic Acid Sunscreen", "Dr. Sheth's"],
        ["K-Secret Seoul 1days Sunscreen", "K-Secret"],
        ["Cera Ve Foaming Facial Cleanser", "CeraVe"]
    ])("finds the brand in %s", (name, brand) => {
        expect(getBrand(name)).toBe(brand);
    });

    it("does not match a brand that is only the start of another word, and returns null for unknown brands", () => {
        expect(getBrand("Simplest Gentle Cleanser")).toBeNull();
        expect(getBrand("Combo 03 - Glass Skin Duo (Cosrx Advanced Snail 92)")).toBeNull();
        expect(getBrand("Some Unknown Brand Serum")).toBeNull();
    });
});

describe("brand options and filter", () => {
    const groups = [
        group("Cosrx Snail Essence 30ml", [500, 600]),
        group("Cosrx Salicylic Cleanser 150ml", [800]),
        group("Anua Heartleaf Toner 250ml", [1300]),
        group("Some Unknown Brand Serum", [300])
    ];

    it("counts products per brand, most first, and skips unknown brands", () => {
        expect(getBrandOptions(groups)).toEqual([
            { brand: "COSRX", count: 2 },
            { brand: "Anua", count: 1 }
        ]);
    });

    it("keeps only the chosen brand, or everything when none is chosen", () => {
        expect(filterGroupsByBrand(groups, "COSRX")).toHaveLength(2);
        expect(filterGroupsByBrand(groups, null)).toHaveLength(4);
    });
});

describe("price filter", () => {
    const groups = [group("A", [449, 849]), group("B", [1500]), group("C", [300, 520])];

    it("keeps products that at least one store sells inside the range", () => {
        expect(filterGroupsByPrice(groups, { min: 500, max: 1000 }).map((g) => g.name)).toEqual(["A", "C"]);
        expect(filterGroupsByPrice(groups, { min: 1000, max: null }).map((g) => g.name)).toEqual(["B"]);
        expect(filterGroupsByPrice(groups, { min: null, max: 400 }).map((g) => g.name)).toEqual(["C"]);
        expect(filterGroupsByPrice(groups, { min: null, max: null })).toHaveLength(3);
    });

    it("parses typed amounts", () => {
        expect(parsePriceInput("1,200")).toBe(1200);
        expect(parsePriceInput("৳ 500")).toBe(500);
        expect(parsePriceInput("")).toBeNull();
        expect(parsePriceInput("abc")).toBeNull();
    });
});
