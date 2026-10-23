import { beforeEach, describe, expect, it } from "vitest";
import { ProductGroup } from "./product-discovery.grouping";
import {
    isInWishlist,
    loadWishlist,
    saveWishlist,
    toggleWishlistItem,
    toWishlistItem
} from "./product-discovery.wishlist";

const group = (key: string, name: string, offers: Array<[string, number]>): ProductGroup => ({
    key,
    name,
    imageUrls: ["https://img.example/a.jpg"],
    offers: offers.map(([storeKey, price]) => ({
        productName: name,
        price,
        productUrl: `https://${storeKey}/${key}`,
        imageUrl: "",
        sourceWebsite: storeKey,
        storeKey
    })),
    lowestPrice: Math.min(...offers.map(([, price]) => price)),
    highestPrice: Math.max(...offers.map(([, price]) => price)),
    storeCount: offers.length
});

const serum = group("nineless|10%|30ml", "Nineless B-Boost Serum 30ml", [["skinnora.com", 1090], ["kireibd.com", 1480]]);
const toner = group("toner|150ml", "Anua Toner 150ml", [["arogga.com", 900]]);
const when = new Date("2026-10-24T10:00:00Z");

describe("wishlist", () => {
    beforeEach(() => localStorage.clear());

    it("saves a snapshot of every store's price and toggles it off again", () => {
        const saved = toggleWishlistItem([], serum, when);

        expect(saved).toHaveLength(1);
        expect(saved[0]).toMatchObject({ name: serum.name, savedAt: when.toISOString() });
        expect(saved[0].offers.map((o) => o.price)).toEqual([1090, 1480]);
        expect(toggleWishlistItem(saved, serum)).toEqual([]);
    });

    it("lists the newest saved product first", () => {
        const items = toggleWishlistItem(toggleWishlistItem([], serum), toner);

        expect(items.map((i) => i.name)).toEqual([toner.name, serum.name]);
    });

    it("still recognises a saved product when its grouping key shifts, via a shared store link", () => {
        const saved = [toWishlistItem(serum)];
        const shifted = { ...serum, key: "nineless|b-boost|10%|30ml" };

        expect(isInWishlist(saved, shifted)).toBe(true);
        expect(isInWishlist(saved, toner)).toBe(false);
        expect(toggleWishlistItem(saved, shifted)).toEqual([]);
    });

    it("round-trips through storage and drops corrupt entries", () => {
        saveWishlist([toWishlistItem(serum, when)]);
        expect(loadWishlist()).toHaveLength(1);

        localStorage.setItem("comparehub_wishlist", JSON.stringify([{ key: 1 }, toWishlistItem(toner, when)]));
        expect(loadWishlist().map((i) => i.name)).toEqual([toner.name]);

        localStorage.setItem("comparehub_wishlist", "{oops");
        expect(loadWishlist()).toEqual([]);
    });
});
