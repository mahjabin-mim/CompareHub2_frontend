import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildGoogleAuthUrl, completeGoogleSignIn, startGoogleSignIn } from "./google-redirect";

const begin = (next = "/wishlist") => {
    startGoogleSignIn("client.apps.googleusercontent.com", next, "https://comparehub2.vercel.app");
    return JSON.parse(sessionStorage.getItem("comparehub_google_signin")!) as { state: string; nonce: string; next: string };
};

describe("buildGoogleAuthUrl", () => {
    it("asks Google for an ID token for this client, with the account chooser", () => {
        const url = new URL(buildGoogleAuthUrl({ clientId: "c", redirectUri: "https://x.test/auth/google/callback", state: "s", nonce: "n" }));

        expect(Object.fromEntries(url.searchParams)).toEqual({
            client_id: "c", redirect_uri: "https://x.test/auth/google/callback", response_type: "id_token",
            scope: "openid email profile", state: "s", nonce: "n", prompt: "select_account"
        });
    });
});

describe("completeGoogleSignIn", () => {
    beforeEach(() => {
        sessionStorage.clear();
        vi.useRealTimers();
    });

    it("returns the token with the nonce and destination remembered for this attempt", () => {
        const pending = begin("/wishlist");

        expect(completeGoogleSignIn(`#id_token=abc.def.ghi&state=${pending.state}&other=1`)).toEqual({ idToken: "abc.def.ghi", nonce: pending.nonce, next: "/wishlist" });
    });

    it("refuses an answer whose state is not the one we sent, so a forged link can't sign anyone in", () => {
        begin();

        expect(() => completeGoogleSignIn("#id_token=abc&state=forged")).toThrow("Google sign-in failed");
        expect(() => completeGoogleSignIn("#id_token=abc")).toThrow();
    });

    it("lets each attempt be answered only once", () => {
        const pending = begin();
        const answer = `#id_token=abc&state=${pending.state}`;

        completeGoogleSignIn(answer);

        expect(() => completeGoogleSignIn(answer)).toThrow("expired");
    });

    it("refuses an answer when no sign-in was started here, or it was started too long ago", () => {
        expect(() => completeGoogleSignIn("#id_token=abc&state=whatever")).toThrow("expired");

        vi.useFakeTimers();
        const pending = begin();
        vi.advanceTimersByTime(11 * 60 * 1000);
        expect(() => completeGoogleSignIn(`#id_token=abc&state=${pending.state}`)).toThrow("expired");
    });

    it("explains a cancelled sign-in and unknown errors in plain words", () => {
        begin();
        expect(() => completeGoogleSignIn("#error=access_denied")).toThrow("cancelled");

        begin();
        expect(() => completeGoogleSignIn("", "?error=server_error")).toThrow("Google sign-in failed");
    });
});
