import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/api-client", () => ({
    apiClient: {
        post: vi.fn()
    }
}));

import { apiClient } from "@/lib/api-client";
import { authenticationService } from "./authentication.services";

const postMock = vi.mocked(apiClient.post);

describe("authenticationService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("calls login endpoint and returns auth data", async () => {
        const payload = { email: "test@test.com", password: "pass" };
        const mockResponse = {
            data: {
                data: {
                    userId: "1",
                    email: "test@test.com",
                    token: "abc"
                }
            }
        };

        postMock.mockResolvedValue(mockResponse);

        const result = await authenticationService.login(payload);

        expect(result).toEqual(mockResponse.data.data);
        expect(postMock).toHaveBeenCalledWith("/api/v1/auth/login", payload);
    });

    it("calls register endpoint and returns auth data", async () => {
        const payload = { fullName: "Test User", email: "test@test.com", password: "pass" };
        const mockResponse = {
            data: {
                data: {
                    userId: "2",
                    email: "test@test.com",
                    token: "xyz"
                }
            }
        };

        postMock.mockResolvedValue(mockResponse);

        const result = await authenticationService.register(payload);

        expect(result).toEqual(mockResponse.data.data);
        expect(postMock).toHaveBeenCalledWith("/api/v1/auth/register", payload);
    });
});
