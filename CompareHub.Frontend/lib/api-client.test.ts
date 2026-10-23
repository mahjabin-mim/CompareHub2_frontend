import { describe, expect, it } from "vitest";
import { apiClient } from "./api-client";

describe("apiClient", () => {
    it("has default baseURL when env var is missing", () => {
        const baseURL = apiClient.defaults.baseURL;

        expect(baseURL).toBe("http://localhost:5000");
    });

    it("sets JSON content type headers by default", () => {
        const headers = apiClient.defaults.headers as Record<string, any>;
        const contentType = headers["Content-Type"] ?? headers.common?.["Content-Type"];

        expect(contentType).toBe("application/json");
    });
});

describe("apiClient authentication", () => {
    it("adds the saved token to every request", async () => {
        localStorage.setItem("comparehub_token", "jwt-abc");
        const handler = (apiClient.interceptors.request as unknown as { handlers: Array<{ fulfilled: (c: { headers: Record<string, string> }) => { headers: Record<string, string> } }> }).handlers[0];

        const config = handler.fulfilled({ headers: {} });

        expect(config.headers.Authorization).toBe("Bearer jwt-abc");
        localStorage.clear();
    });

    it("signs the visitor out when the server rejects their token", async () => {
        const { authStore } = await import("@/features/Authentications/auth-store");
        authStore.signIn({ userId: "1", email: "mim@example.com", token: "expired", fullName: "Mim" });
        const { AxiosError } = await import("axios");
        const handler = (apiClient.interceptors.response as unknown as { handlers: Array<{ rejected: (e: unknown) => Promise<unknown> }> }).handlers[0];

        await expect(handler.rejected(new AxiosError("no", "401", undefined, undefined, { status: 401 } as never))).rejects.toBeTruthy();

        expect(authStore.getSnapshot().user).toBeNull();
        expect(localStorage.getItem("comparehub_token")).toBeNull();
    });

    it("leaves a signed-in visitor alone for other errors", async () => {
        const { authStore } = await import("@/features/Authentications/auth-store");
        authStore.signIn({ userId: "1", email: "mim@example.com", token: "fine", fullName: "Mim" });
        const { AxiosError } = await import("axios");
        const handler = (apiClient.interceptors.response as unknown as { handlers: Array<{ rejected: (e: unknown) => Promise<unknown> }> }).handlers[0];

        await expect(handler.rejected(new AxiosError("no", "500", undefined, undefined, { status: 500 } as never))).rejects.toBeTruthy();

        expect(authStore.getSnapshot().user?.email).toBe("mim@example.com");
        authStore.signOut();
    });
});
