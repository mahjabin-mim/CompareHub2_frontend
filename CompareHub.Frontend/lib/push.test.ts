import { afterEach, describe, expect, it, vi } from "vitest";
import { getPushState, isPushSupported, urlBase64ToUint8Array } from "./push";

describe("urlBase64ToUint8Array", () => {
    it("decodes base64url text (no padding, - and _) into bytes", () => {
        // bytes 251, 255, 191 encode to "-_-_" in base64url
        expect(Array.from(urlBase64ToUint8Array("-_-_"))).toEqual([251, 255, 191]);
        expect(Array.from(urlBase64ToUint8Array("SGk"))).toEqual([72, 105]);
    });

    it("turns a 65-byte VAPID public key into 65 bytes", () => {
        const key = btoa(String.fromCharCode(4, ...Array.from({ length: 64 }, (_, i) => i + 1))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

        expect(urlBase64ToUint8Array(key)).toHaveLength(65);
    });
});

describe("push support", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("reports unsupported where the browser has no push (like this test browser)", async () => {
        expect(isPushSupported()).toBe(false);
        expect(await getPushState()).toBe("unsupported");
    });

    it("reports blocked when the user has denied notifications", async () => {
        vi.stubGlobal("PushManager", class {});
        vi.stubGlobal("Notification", { permission: "denied" });
        Object.defineProperty(navigator, "serviceWorker", { value: {}, configurable: true });

        expect(await getPushState()).toBe("blocked");
        // @ts-expect-error cleaning up the stub
        delete navigator.serviceWorker;
    });
});
