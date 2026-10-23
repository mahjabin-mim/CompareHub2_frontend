import { describe, expect, it } from "vitest";
import { groupProducts } from "./product-discovery.grouping";
import { StoreProductResult } from "./product-discovery.types";

// Names and prices below are real listings captured from the stores.
let urlCounter = 0;
const offer = (productName: string, price: number, storeKey: string): StoreProductResult => ({
    productName,
    price,
    productUrl: `https://${storeKey}/p/${++urlCounter}`,
    imageUrl: "",
    sourceWebsite: storeKey,
    storeKey
});

const groupOf = (groups: ReturnType<typeof groupProducts>, name: string) => groups.find((g) => g.offers.some((o) => o.productName === name))!;

describe("groupProducts", () => {
    it("groups the same product across stores despite spelling, spacing and size formatting", () => {
        const groups = groupProducts([
            offer("Nineless B-Boost 10% Niacinamide Serum 30ml", 1090, "skinnora.com"),
            offer("NINELESS B Boost 10% Niacinamide Serum 30ml", 1190, "emartwayskincare.com.bd"),
            offer("Nineless B Boost 10% Niacinamide Serum (30ML)", 1199, "beautybooth.com.bd"),
            offer("Nineless B-boost 10% Niacinamide Serum-30ml", 1450, "dhalishop.com"),
            offer("NineLess B-Boost 10% Niacinamide Serum", 1450, "pixielabellabangladesh.com")
        ]);

        expect(groups).toHaveLength(1);
        expect(groups[0]).toMatchObject({ lowestPrice: 1090, highestPrice: 1450, storeCount: 5 });
        expect(groups[0].offers.map((o) => o.price)).toEqual([1090, 1190, 1199, 1450, 1450]);
    });

    it("keeps sachets and other sizes apart, and a size-less sachet out of the bottle's price", () => {
        const groups = groupProducts([
            offer("Nineless B Boost 10% Niacinamide Serum 30ml", 1480, "kireibd.com"),
            offer("Nineless B Boost 10%Niacinamide Serum-2ml", 60, "dhalishop.com"),
            offer("Nineless B-Boost 10%Niacinamide Serum (2ml)", 100, "beautybooth.com.bd"),
            offer("Nineless 10% Niacinamide Serum (Sachet)", 50, "perfectobd.com")
        ]);

        expect(groups).toHaveLength(3);
        expect(groupOf(groups, "Nineless B Boost 10% Niacinamide Serum 30ml").lowestPrice).toBe(1480);
        expect(groupOf(groups, "Nineless B Boost 10%Niacinamide Serum-2ml").storeCount).toBe(2);
    });

    it("keeps different strengths and sizes apart and puts a size-less listing with the closest price", () => {
        const groups = groupProducts([
            offer("Minimalist Niacinamide 10% Face Serum 30ml", 1450, "kireibd.com"),
            offer("Minimalist Niacinamide 05% Face Serum 30ml", 1350, "kireibd.com"),
            offer("Minimalist Niacinamide 5% Face Serum-10ml", 699, "dhalishop.com"),
            offer("Minimalist Niacinamide 5% Face Serum", 700, "perfectobd.com"),
            offer("The Ordinary Niacinamide 10% + Zinc 1% Serum", 1250, "pixielabellabangladesh.com"),
            offer("The Ordinary Niacinamide 10%+Zinc1% Serum 30ml", 1090, "arogga.com"),
            offer("The Ordinary Niacinamide 10% + Zinc 1% Serum 60ml", 2250, "kireibd.com")
        ]);

        expect(groups).toHaveLength(5);
        expect(groupOf(groups, "Minimalist Niacinamide 5% Face Serum").offers.map((o) => o.price)).toEqual([699, 700]);
        expect(groupOf(groups, "The Ordinary Niacinamide 10% + Zinc 1% Serum").offers.map((o) => o.price)).toEqual([1090, 1250]);
        expect(groupOf(groups, "The Ordinary Niacinamide 10% + Zinc 1% Serum 60ml").storeCount).toBe(1);
    });

    it("keeps product variants and condition deals apart", () => {
        const groups = groupProducts([
            offer("Round Lab Birch Juice Moisturizing Sunscreen 50ml", 1900, "perfectobd.com"),
            offer("Round Lab Birch Juice Moisturizing Tone-Up Sunscreen Spf50+++ - 50ml", 1580, "koreanmartbd.com"),
            offer("The Derma Co 1% Hyaluronic Sunscreen Aqua Gel SPF 50 PA++ 50g", 1090, "kireibd.com"),
            offer("The Derma Co 1% Hyaluronic Sunscreen Oil-Free Matte Gel SPF 50 PA++++ 50g", 1250, "makeupchari.com"),
            offer("I'm from Rice Whip Facial Cleanser 150ml", 1550, "klassy.com.bd"),
            offer("(NO OUTERBOX) I’M FROM – Rice Whip Facial Cleanser 150ml", 1000, "thelilium.shop")
        ]);

        expect(groups).toHaveLength(6);
    });

    it("accepts extra descriptive words on one side", () => {
        const groups = groupProducts([
            offer("Minimalist SPF 50 Sunscreen 50g", 900, "makeupchari.com"),
            offer("Minimalist SPF 50 PA ++++ Sunscreen with Multi-Vitamins 50g", 1230, "klassy.com.bd"),
            offer("Medicube No Cast Just Glow Collagen Sunscreen 15ml", 499, "makeupchari.com"),
            offer("Medicube Sunscreen No Cast Just Glow-15ml", 650, "dhalishop.com")
        ]);

        expect(groups).toHaveLength(2);
    });

    it("shows a store's duplicate listing once", () => {
        const groups = groupProducts([
            offer("Cosrx Advanced Snail 96 Mucin Power Essence", 750, "pixielabellabangladesh.com"),
            offer("Cosrx Advanced Snail 96 Mucin Power Essence", 750, "pixielabellabangladesh.com"),
            offer("Cosrx Advanced Snail 96 Mucin Power Essence 30ml", 690, "kireibd.com")
        ]);

        expect(groups).toHaveLength(1);
        expect(groups[0].offers).toHaveLength(2);
    });
});
