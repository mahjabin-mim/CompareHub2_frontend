import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: vi.fn() }) }));
vi.mock("./product-discovery.wishlist.services", () => ({
    wishlistService: { list: vi.fn(), add: vi.fn(), remove: vi.fn(), alerts: vi.fn(), markAlertsRead: vi.fn(), importItems: vi.fn() },
    pushService: {}
}));

import { authStore } from "../Authentications/auth-store";
import { ProductGroup } from "./product-discovery.grouping";
import { WishlistItem } from "./product-discovery.wishlist";
import { useWishlist } from "./product-discovery.wishlist.hooks";
import { wishlistService } from "./product-discovery.wishlist.services";

const service = vi.mocked(wishlistService);

const group: ProductGroup = {
    key: "nineless|30ml",
    name: "Nineless Serum 30ml",
    imageUrls: [],
    offers: [{ productName: "n", price: 1090, productUrl: "https://skinnora.com/p/1", imageUrl: "", sourceWebsite: "skinnora.com", storeKey: "skinnora.com" }],
    lowestPrice: 1090,
    highestPrice: 1090,
    storeCount: 1
};

const savedItem: WishlistItem = {
    id: "w1", key: "nineless|30ml", name: "Nineless Serum 30ml", imageUrls: [], createdAt: "2026-10-24T00:00:00Z", lastCheckedAt: null,
    offers: [{ id: "o1", storeKey: "skinnora.com", productUrl: "https://skinnora.com/p/1", savedPrice: 1090, currentPrice: 1090, lastSeenAt: "2026-10-24T00:00:00Z", history: [] }]
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>
);

describe("useWishlist", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        authStore.signOut();
        service.list.mockResolvedValue([]);
        service.alerts.mockResolvedValue({ alerts: [], unreadCount: 0 });
        window.history.pushState(null, "", "/?q=serum");
    });

    it("sends a signed-out visitor to sign in, remembering where they were, instead of saving", () => {
        const { result } = renderHook(() => useWishlist(), { wrapper });

        act(() => result.current.toggle(group));

        expect(push).toHaveBeenCalledWith("/login?reason=wishlist&next=" + encodeURIComponent("/?q=serum"));
        expect(service.add).not.toHaveBeenCalled();
        expect(service.list).not.toHaveBeenCalled();
    });

    describe("when signed in", () => {
        beforeEach(() => authStore.signIn({ userId: "1", email: "mim@example.com", token: "jwt", fullName: "Mim" }));

        it("loads the account's wishlist and recognises saved products", async () => {
            service.list.mockResolvedValue([savedItem]);
            const { result } = renderHook(() => useWishlist(), { wrapper });

            await waitFor(() => expect(result.current.items).toHaveLength(1));
            expect(result.current.has(group)).toBe(true);
            expect(result.current.has({ ...group, key: "other", offers: [{ ...group.offers[0], productUrl: "https://skinnora.com/p/other" }] })).toBe(false);
        });

        it("saves a product that is not saved yet, and removes one that is", async () => {
            service.add.mockResolvedValue(savedItem);
            service.remove.mockResolvedValue();
            const { result } = renderHook(() => useWishlist(), { wrapper });
            await waitFor(() => expect(service.list).toHaveBeenCalled());

            act(() => result.current.toggle(group));
            await waitFor(() => expect(result.current.has(group)).toBe(true));
            expect(service.add.mock.calls[0][0]).toMatchObject({ key: "nineless|30ml", offers: [{ storeKey: "skinnora.com", price: 1090 }] });

            act(() => result.current.toggle(group));
            await waitFor(() => expect(result.current.has(group)).toBe(false));
            expect(service.remove.mock.calls[0][0]).toBe("w1");
            expect(push).not.toHaveBeenCalled();
        });

        it("exposes the unread price-drop count for the navbar badge", async () => {
            service.alerts.mockResolvedValue({ alerts: [], unreadCount: 3 });
            const { result } = renderHook(() => useWishlist(), { wrapper });

            await waitFor(() => expect(result.current.unreadAlerts).toBe(3));
        });
    });
});
