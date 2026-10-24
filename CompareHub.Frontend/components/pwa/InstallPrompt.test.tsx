import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ANDROID_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/126.0 Mobile Safari/537.36";
const IPHONE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1";

const renderPrompt = async () => {
    vi.resetModules();
    const { InstallPrompt } = await import("./InstallPrompt");
    return render(<InstallPrompt />);
};

const setUserAgent = (ua: string) => Object.defineProperty(navigator, "userAgent", { value: ua, configurable: true });
const installable = () => act(() => { window.dispatchEvent(new Event("beforeinstallprompt")); });

describe("InstallPrompt", () => {
    beforeEach(() => {
        localStorage.clear();
        window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as never;
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("offers the Android app download only once the app has been published", async () => {
        setUserAgent(ANDROID_UA);
        await renderPrompt();
        installable();
        expect(screen.getByText("Install CompareHub")).toBeTruthy();
        expect(screen.queryByText("Or download the Android app")).toBeNull();

        vi.stubEnv("NEXT_PUBLIC_ANDROID_APP", "true");
        document.body.innerHTML = "";
        await renderPrompt();
        installable();
        expect(screen.getByText("Or download the Android app").getAttribute("href")).toContain("CompareHub2_android/releases/latest/download/CompareHub.apk");
    });

    it("explains Share > Add to Home Screen on iPhone and never offers the Android app", async () => {
        vi.stubEnv("NEXT_PUBLIC_ANDROID_APP", "true");
        setUserAgent(IPHONE_UA);
        await renderPrompt();

        expect(screen.getByText(/Add to Home Screen/)).toBeTruthy();
        expect(screen.queryByText("Or download the Android app")).toBeNull();
    });

    it("stays hidden on desktop, when already installed, and after being dismissed", async () => {
        setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/126.0 Safari/537.36");
        const desktop = await renderPrompt();
        installable();
        expect(desktop.queryByRole("dialog")).toBeNull();
        desktop.unmount();

        setUserAgent(ANDROID_UA);
        window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as never;
        const installed = await renderPrompt();
        installable();
        expect(installed.queryByRole("dialog")).toBeNull();
        installed.unmount();

        window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as never;
        localStorage.setItem("comparehub_install_dismissed", "1");
        const dismissed = await renderPrompt();
        installable();
        expect(dismissed.queryByRole("dialog")).toBeNull();
    });
});
