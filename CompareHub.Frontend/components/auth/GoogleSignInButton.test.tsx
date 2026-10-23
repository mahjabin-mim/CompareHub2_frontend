import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GoogleSignInButton } from "./GoogleSignInButton";

describe("GoogleSignInButton", () => {
    afterEach(() => {
        delete window.google;
    });

    const installFakeGoogle = () => {
        let callback: (response: { credential?: string }) => void = () => {};
        const initialize = vi.fn((options: { callback: typeof callback }) => (callback = options.callback));
        const renderButton = vi.fn();
        window.google = { accounts: { id: { initialize, renderButton } } };
        return { initialize, renderButton, fire: (response: { credential?: string }) => callback(response) };
    };

    it("sets up Google with this site's client id and draws Google's own button", async () => {
        const google = installFakeGoogle();

        const { getByTestId } = render(<GoogleSignInButton clientId="my-client-id" onCredential={() => {}} />);

        await waitFor(() => expect(google.renderButton).toHaveBeenCalled());
        expect(google.initialize).toHaveBeenCalledWith(expect.objectContaining({ client_id: "my-client-id" }));
        expect(google.renderButton.mock.calls[0][0]).toBe(getByTestId("google-button"));
    });

    it("passes Google's credential on, and reports a missing one as an error", async () => {
        const google = installFakeGoogle();
        const onCredential = vi.fn();
        const onError = vi.fn();
        render(<GoogleSignInButton clientId="id" onCredential={onCredential} onError={onError} />);
        await waitFor(() => expect(google.renderButton).toHaveBeenCalled());

        google.fire({ credential: "the-id-token" });
        google.fire({});

        expect(onCredential).toHaveBeenCalledWith("the-id-token");
        expect(onError).toHaveBeenCalledWith(expect.stringContaining("Google sign-in failed"));
    });
});
