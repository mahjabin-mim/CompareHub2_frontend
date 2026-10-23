import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }));
vi.mock("@/features/ProductDiscovery/product-discovery.wishlist.services", () => ({
    wishlistService: { importItems: vi.fn(), list: vi.fn(), alerts: vi.fn() },
    pushService: {}
}));

import { authStore } from "@/features/Authentications/auth-store";
import { wishlistService } from "@/features/ProductDiscovery/product-discovery.wishlist.services";
import { AccountEffects } from "./AccountEffects";

const service = vi.mocked(wishlistService);
const legacy = [{ key: "k", name: "Serum", imageUrls: [], offers: [{ storeKey: "kireibd.com", price: 100, productUrl: "https://kireibd.com/p" }] }];

const renderEffects = () =>
    render(<QueryClientProvider client={new QueryClient()}><AccountEffects /></QueryClientProvider>);

describe("AccountEffects", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        authStore.signOut();
        service.importItems.mockResolvedValue([]);
        service.list.mockResolvedValue([]);
        service.alerts.mockResolvedValue({ alerts: [], unreadCount: 0 });
    });

    it("moves a wishlist saved on this device into the account after sign-in, then clears it", async () => {
        localStorage.setItem("comparehub_wishlist", JSON.stringify(legacy));
        authStore.signIn({ userId: "1", email: "mim@example.com", token: "jwt", fullName: "Mim" });

        renderEffects();

        await waitFor(() => expect(service.importItems).toHaveBeenCalledTimes(1));
        expect(service.importItems.mock.calls[0][0]).toEqual(legacy);
        await waitFor(() => expect(localStorage.getItem("comparehub_wishlist")).toBeNull());
    });

    it("keeps the device wishlist when the import fails so it can be retried", async () => {
        localStorage.setItem("comparehub_wishlist", JSON.stringify(legacy));
        authStore.signIn({ userId: "1", email: "mim@example.com", token: "jwt", fullName: "Mim" });
        service.importItems.mockRejectedValue(new Error("offline"));

        renderEffects();

        await waitFor(() => expect(service.importItems).toHaveBeenCalled());
        expect(localStorage.getItem("comparehub_wishlist")).not.toBeNull();
    });

    it("does nothing while signed out", () => {
        localStorage.setItem("comparehub_wishlist", JSON.stringify(legacy));

        renderEffects();

        expect(service.importItems).not.toHaveBeenCalled();
    });
});
