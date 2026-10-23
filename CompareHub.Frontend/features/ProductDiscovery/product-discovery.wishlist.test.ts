import { beforeEach, describe, expect, it } from "vitest";
import { ProductGroup } from "./product-discovery.grouping";
import {
    buildLowestPriceSeries,
    clearLegacyWishlist,
    matchesGroup,
    normalizeUrl,
    percentChange,
    readLegacyWishlist,
    toAddRequest
} from "./product-discovery.wishlist";

const group = (key: string, offers: Array<[string, number, string]>): ProductGroup => ({
    key,
    name: "Nineless B-Boost Serum 30ml",
    imageUrls: ["a", "b", "c", "d"],
    offers: offers.map(([storeKey, price, productUrl]) => ({ productName: "n", price, productUrl, imageUrl: "", sourceWebsite: storeKey, storeKey })),
    lowestPrice: Math.min(...offers.map((o) => o[1])),
    highestPrice: Math.max(...offers.map((o) => o[1])),
    storeCount: offers.length
});

describe("toAddRequest", () => {
    it("sends the name, up to three images and each store's price and link", () => {
        const request = toAddRequest(group("k", [["skinnora.com", 1090, "https://skinnora.com/p/1"]]));

        expect(request).toEqual({
            key: "k",
            name: "Nineless B-Boost Serum 30ml",
            imageUrls: ["a", "b", "c"],
            offers: [{ storeKey: "skinnora.com", price: 1090, productUrl: "https://skinnora.com/p/1" }]
        });
    });
});

describe("normalizeUrl", () => {
    it.each([
        ["https://www.Kireibd.com/Product/Serum/", "kireibd.com/product/serum"],
        ["http://kireibd.com/product/serum?utm_source=x#top", "kireibd.com/product/serum"],
        ["https://shop.example.com/?p=12", "shop.example.com/?p=12"],
        ["not a url ", "not a url"]
    ])("turns %s into %s", (input, expected) => {
        expect(normalizeUrl(input)).toBe(expected);
    });
});

describe("matchesGroup", () => {
    const saved = { key: "old-key", offers: [{ productUrl: "https://www.skinnora.com/p/serum/" }] } as never;

    it("matches by key or by a shared store link even when the key has shifted", () => {
        expect(matchesGroup(saved, group("old-key", [["x", 1, "https://x.com/other"]]))).toBe(true);
        expect(matchesGroup(saved, group("new-key", [["skinnora.com", 1, "https://skinnora.com/p/serum"]]))).toBe(true);
        expect(matchesGroup(saved, group("new-key", [["skinnora.com", 1, "https://skinnora.com/p/other"]]))).toBe(false);
    });
});

describe("percentChange", () => {
    it("rounds the change from the saved price", () => {
        expect(percentChange(1000, 880)).toBe(-12);
        expect(percentChange(1000, 1100)).toBe(10);
        expect(percentChange(0, 500)).toBe(0);
    });
});

describe("buildLowestPriceSeries", () => {
    const day = (n: number) => `2026-10-${String(n).padStart(2, "0")}T00:00:00Z`;

    it("follows the best price across stores at each change", () => {
        const series = buildLowestPriceSeries([
            { history: [{ price: 1200, recordedAt: day(1) }, { price: 1000, recordedAt: day(5) }] },
            { history: [{ price: 1100, recordedAt: day(1) }, { price: 1300, recordedAt: day(8) }] }
        ]);

        expect(series.map((p) => p.price)).toEqual([1100, 1000]);
        expect(series[1].time).toBe(Date.parse(day(5)));
    });

    it("skips changes that don't move the lowest price and returns nothing for no history", () => {
        const series = buildLowestPriceSeries([
            { history: [{ price: 900, recordedAt: day(1) }, { price: 950, recordedAt: day(2) }] },
            { history: [{ price: 1000, recordedAt: day(1) }] }
        ]);

        expect(series.map((p) => p.price)).toEqual([900, 950]);
        expect(buildLowestPriceSeries([{ history: [] }])).toEqual([]);
    });
});

describe("legacy device wishlist", () => {
    beforeEach(() => localStorage.clear());

    it("reads valid entries in the account format and ignores broken ones", () => {
        localStorage.setItem(
            "comparehub_wishlist",
            JSON.stringify([
                { key: "k", name: "Serum", imageUrls: ["a"], savedAt: "x", offers: [{ storeKey: "kireibd.com", price: 100, productUrl: "https://kireibd.com/p", extra: 1 }] },
                { key: 5 },
                { key: "empty", name: "No offers", offers: [] }
            ])
        );

        expect(readLegacyWishlist()).toEqual([
            { key: "k", name: "Serum", imageUrls: ["a"], offers: [{ storeKey: "kireibd.com", price: 100, productUrl: "https://kireibd.com/p" }] }
        ]);
    });

    it("tolerates corrupt storage and can be cleared", () => {
        localStorage.setItem("comparehub_wishlist", "{oops");
        expect(readLegacyWishlist()).toEqual([]);

        localStorage.setItem("comparehub_wishlist", "[]");
        clearLegacyWishlist();
        expect(localStorage.getItem("comparehub_wishlist")).toBeNull();
    });
});
