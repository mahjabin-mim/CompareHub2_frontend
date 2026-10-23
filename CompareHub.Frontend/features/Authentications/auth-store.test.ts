import { beforeEach, describe, expect, it, vi } from "vitest";
import { authStore, safeNextPath } from "./auth-store";

describe("authStore", () => {
    beforeEach(() => {
        authStore.signOut();
        localStorage.clear();
    });

    it("starts signed out", () => {
        expect(authStore.getSnapshot()).toEqual({ user: null, token: null });
    });

    it("signs in, keeps the token for API calls and notifies listeners", () => {
        const listener = vi.fn();
        const unsubscribe = authStore.subscribe(listener);

        authStore.signIn({ userId: "1", email: "mim@example.com", token: "jwt-token", fullName: "Mim Rahman" });

        expect(authStore.getSnapshot()).toEqual({ token: "jwt-token", user: { email: "mim@example.com", fullName: "Mim Rahman" } });
        expect(localStorage.getItem("comparehub_token")).toBe("jwt-token");
        expect(listener).toHaveBeenCalledTimes(1);
        unsubscribe();
    });

    it("returns the same snapshot object until something changes, as React requires", () => {
        authStore.signIn({ userId: "1", email: "mim@example.com", token: "t", fullName: "Mim" });

        expect(authStore.getSnapshot()).toBe(authStore.getSnapshot());
    });

    it("falls back to the part of the email before @ when there is no name", () => {
        authStore.signIn({ userId: "1", email: "mim@example.com", token: "t" });

        expect(authStore.getSnapshot().user?.fullName).toBe("mim");
    });

    it("signs out everywhere: token, user and the legacy email key", () => {
        localStorage.setItem("comparehub_email", "old@example.com");
        authStore.signIn({ userId: "1", email: "mim@example.com", token: "t", fullName: "Mim" });
        const listener = vi.fn();
        authStore.subscribe(listener);

        authStore.signOut();

        expect(authStore.getSnapshot()).toEqual({ user: null, token: null });
        expect(localStorage.getItem("comparehub_token")).toBeNull();
        expect(localStorage.getItem("comparehub_user")).toBeNull();
        expect(localStorage.getItem("comparehub_email")).toBeNull();
        expect(listener).toHaveBeenCalled();
    });

    it("has no server-side signed-in state, so the first render matches the server", () => {
        authStore.signIn({ userId: "1", email: "mim@example.com", token: "t", fullName: "Mim" });

        expect(authStore.getServerSnapshot()).toEqual({ user: null, token: null });
    });
});

describe("safeNextPath", () => {
    it.each([
        ["/wishlist", "/wishlist"],
        ["/?q=sunscreen", "/?q=sunscreen"],
        ["//evil.example.com", "/"],
        ["https://evil.example.com", "/"],
        ["/\\evil.example.com", "/"],
        ["javascript:alert(1)", "/"],
        ["", "/"],
        [null, "/"],
        [undefined, "/"]
    ])("turns %s into %s", (input, expected) => {
        expect(safeNextPath(input)).toBe(expected);
    });
});
