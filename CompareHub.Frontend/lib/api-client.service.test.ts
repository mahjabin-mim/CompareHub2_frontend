import { describe, expect, it, vi } from "vitest";
import { apiClient } from "./api-client";

describe("apiClient service integration", () => {
    it("uses the axios instance for posts", async () => {
        const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue({ data: { data: { userId: "1", email: "test@test.com", token: "abc" } } });

        const response = await apiClient.post("/api/v1/auth/login", {
            email: "test@test.com",
            password: "pass"
        });

        expect(postSpy).toHaveBeenCalledWith("/api/v1/auth/login", {
            email: "test@test.com",
            password: "pass"
        });
        expect(response.data.data.token).toBe("abc");
    });
});
