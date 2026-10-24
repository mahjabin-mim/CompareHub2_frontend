import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, push: vi.fn() }) }));
vi.mock("next/link", () => ({ default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => <a href={href} {...props}>{children}</a> }));
vi.mock("@/features/Authentications/authentication.services", () => ({ authenticationService: { loginWithGoogle: vi.fn() } }));

import { authStore } from "@/features/Authentications/auth-store";
import { authenticationService } from "@/features/Authentications/authentication.services";
import GoogleCallbackPage from "./page";

const service = vi.mocked(authenticationService);

const arriveFromGoogle = (hash: string, pending?: { state: string; nonce: string; next: string }) => {
    sessionStorage.clear();
    if (pending) sessionStorage.setItem("comparehub_google_signin", JSON.stringify({ ...pending, startedAt: Date.now() }));
    window.history.pushState(null, "", "/auth/google/callback" + hash);
};

const renderPage = () =>
    render(<QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}><GoogleCallbackPage /></QueryClientProvider>);

describe("Google callback page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        authStore.signOut();
    });

    it("finishes the sign-in with the token and nonce, removes the token from the address bar, and moves on", async () => {
        service.loginWithGoogle.mockResolvedValue({ userId: "1", email: "mim@example.com", token: "jwt", fullName: "Mim" });
        arriveFromGoogle("#id_token=g.id.token&state=abc", { state: "abc", nonce: "n-nonce-1234567890", next: "/wishlist" });

        renderPage();

        await waitFor(() => expect(replace).toHaveBeenCalledWith("/wishlist"));
        expect(service.loginWithGoogle.mock.calls[0][0]).toEqual({ idToken: "g.id.token", nonce: "n-nonce-1234567890" });
        expect(authStore.getSnapshot().user?.email).toBe("mim@example.com");
        expect(window.location.hash).toBe("");
        expect(window.location.pathname).toBe("/auth/google/callback");
    });

    it("never redirects to another site even if the stored destination was tampered with", async () => {
        service.loginWithGoogle.mockResolvedValue({ userId: "1", email: "a@b.com", token: "jwt", fullName: "A" });
        arriveFromGoogle("#id_token=t&state=abc", { state: "abc", nonce: "n-nonce-1234567890", next: "https://evil.example.com" });

        renderPage();

        await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    });

    it("shows an error and a way back when the answer is forged, and never calls the backend", async () => {
        arriveFromGoogle("#id_token=t&state=forged", { state: "abc", nonce: "n-nonce-1234567890", next: "/" });

        renderPage();

        expect((await screen.findByRole("alert")).textContent).toContain("Google sign-in failed");
        expect(screen.getByRole("link", { name: "Back to sign in" }).getAttribute("href")).toBe("/login");
        expect(service.loginWithGoogle).not.toHaveBeenCalled();
        expect(authStore.getSnapshot().user).toBeNull();
    });

    it("shows the backend's reason when it refuses the token", async () => {
        service.loginWithGoogle.mockRejectedValue(Object.assign(new Error("bad"), { isAxiosError: true }));
        arriveFromGoogle("#id_token=t&state=abc", { state: "abc", nonce: "n-nonce-1234567890", next: "/" });

        renderPage();

        expect((await screen.findByRole("alert")).textContent).toContain("Google sign-in failed");
        expect(replace).not.toHaveBeenCalled();
    });

    it("says so when the visitor cancelled at Google", async () => {
        arriveFromGoogle("#error=access_denied", { state: "abc", nonce: "n-nonce-1234567890", next: "/" });

        renderPage();

        expect((await screen.findByRole("alert")).textContent).toContain("cancelled");
    });
});
