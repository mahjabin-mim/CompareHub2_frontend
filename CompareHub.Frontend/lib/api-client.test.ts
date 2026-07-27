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
