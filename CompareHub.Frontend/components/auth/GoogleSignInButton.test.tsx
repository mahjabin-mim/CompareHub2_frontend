import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleSignInButton } from "./GoogleSignInButton";

describe("GoogleSignInButton", () => {
    const assign = vi.fn();

    beforeEach(() => {
        assign.mockClear();
        sessionStorage.clear();
        Object.defineProperty(window, "location", { value: { ...window.location, assign, origin: "https://comparehub2.vercel.app" }, configurable: true });
    });

    afterEach(() => vi.restoreAllMocks());

    it("sends the visitor to Google's own page, with no popup", () => {
        render(<GoogleSignInButton clientId="my-client.apps.googleusercontent.com" next="/wishlist" />);

        fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));

        const url = new URL(assign.mock.calls[0][0]);
        expect(url.origin + url.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
        expect(url.searchParams.get("client_id")).toBe("my-client.apps.googleusercontent.com");
        expect(url.searchParams.get("redirect_uri")).toBe("https://comparehub2.vercel.app/auth/google/callback");
        expect(url.searchParams.get("response_type")).toBe("id_token");
        expect(url.searchParams.get("scope")).toBe("openid email profile");
    });

    it("remembers where to go afterwards and a fresh random state and nonce for each attempt", () => {
        render(<GoogleSignInButton clientId="id" next="/wishlist" />);

        fireEvent.click(screen.getByRole("button"));
        const first = JSON.parse(sessionStorage.getItem("comparehub_google_signin")!);
        fireEvent.click(screen.getByRole("button"));
        const second = JSON.parse(sessionStorage.getItem("comparehub_google_signin")!);

        expect(first.next).toBe("/wishlist");
        expect(first.state).toMatch(/^[0-9a-f]{32}$/);
        expect(first.nonce).toMatch(/^[0-9a-f]{32}$/);
        expect(second.state).not.toBe(first.state);
        expect(second.nonce).not.toBe(first.nonce);
        expect(new URL(assign.mock.calls[0][0]).searchParams.get("state")).toBe(first.state);
        expect(new URL(assign.mock.calls[0][0]).searchParams.get("nonce")).toBe(first.nonce);
    });
});
