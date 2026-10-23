import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, push: vi.fn() }) }));
vi.mock("next/link", () => ({ default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => <a href={href} {...props}>{children}</a> }));
vi.mock("@/features/Authentications/authentication.services", () => ({
    authenticationService: { login: vi.fn(), register: vi.fn(), loginWithGoogle: vi.fn(), getConfig: vi.fn() }
}));
vi.mock("@/components/auth/GoogleSignInButton", () => ({ GoogleSignInButton: () => <div data-testid="google-button" /> }));

import { authStore } from "@/features/Authentications/auth-store";
import { authenticationService } from "@/features/Authentications/authentication.services";
import CreateAccountPage from "../create-account/page";
import LoginPage from "./page";

const service = vi.mocked(authenticationService);

const renderPage = (page: React.ReactElement) => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    return render(<QueryClientProvider client={client}>{page}</QueryClientProvider>);
};

describe("sign in page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        authStore.signOut();
        window.history.pushState(null, "", "/login");
        service.getConfig.mockResolvedValue({ googleClientId: null });
    });

    it("signs in and sends the visitor back where they were headed", async () => {
        window.history.pushState(null, "", "/login?next=%2Fwishlist");
        service.login.mockResolvedValue({ userId: "1", email: "mim@example.com", token: "jwt", fullName: "Mim" });
        renderPage(<LoginPage />);

        fireEvent.change(screen.getByLabelText("Email"), { target: { value: " mim@example.com " } });
        fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret-pass" } });
        fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

        await waitFor(() => expect(replace).toHaveBeenCalledWith("/wishlist"));
        expect(service.login.mock.calls[0][0]).toEqual({ email: "mim@example.com", password: "secret-pass" });
        expect(authStore.getSnapshot().user?.email).toBe("mim@example.com");
    });

    it("never redirects to another site, even if the link says to", async () => {
        window.history.pushState(null, "", "/login?next=https%3A%2F%2Fevil.example.com");
        service.login.mockResolvedValue({ userId: "1", email: "a@b.com", token: "jwt", fullName: "A" });
        renderPage(<LoginPage />);

        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.com" } });
        fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret-pass" } });
        fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

        await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    });

    it("shows the server's message when sign-in fails and stays signed out", async () => {
        service.login.mockRejectedValue(new AxiosError("bad", "400", undefined, undefined, { data: { message: "Invalid email or password." }, status: 400 } as never));
        renderPage(<LoginPage />);

        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.com" } });
        fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong-pass" } });
        fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

        expect((await screen.findByRole("alert")).textContent).toBe("Invalid email or password.");
        expect(authStore.getSnapshot().user).toBeNull();
        expect(replace).not.toHaveBeenCalled();
    });

    it("explains why the visitor was sent here when they tried to save a product", async () => {
        window.history.pushState(null, "", "/login?reason=wishlist&next=%2F");
        renderPage(<LoginPage />);

        expect(await screen.findByText(/Sign in to save products to your wishlist/)).toBeTruthy();
    });

    it("shows the Google button only when the server has Google sign-in set up", async () => {
        service.getConfig.mockResolvedValue({ googleClientId: "client-id" });
        renderPage(<LoginPage />);

        expect(await screen.findByTestId("google-button")).toBeTruthy();
    });

    it("hides the Google button when Google sign-in is not configured", async () => {
        renderPage(<LoginPage />);
        await waitFor(() => expect(service.getConfig).toHaveBeenCalled());

        expect(screen.queryByTestId("google-button")).toBeNull();
    });

    it("skips the page for someone who is already signed in", async () => {
        authStore.signIn({ userId: "1", email: "mim@example.com", token: "jwt", fullName: "Mim" });
        renderPage(<LoginPage />);

        await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    });
});

describe("create account page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        authStore.signOut();
        window.history.pushState(null, "", "/create-account");
        service.getConfig.mockResolvedValue({ googleClientId: null });
    });

    it("creates the account with a trimmed name and email, then signs in", async () => {
        service.register.mockResolvedValue({ userId: "2", email: "new@example.com", token: "jwt", fullName: "New Person" });
        renderPage(<CreateAccountPage />);

        fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "  New Person " } });
        fireEvent.change(screen.getByLabelText("Email"), { target: { value: " new@example.com" } });
        fireEvent.change(screen.getByLabelText("Password"), { target: { value: "long-enough-1" } });
        fireEvent.click(screen.getByRole("button", { name: "Create account" }));

        await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
        expect(service.register.mock.calls[0][0]).toEqual({ fullName: "New Person", email: "new@example.com", password: "long-enough-1" });
        expect(authStore.getSnapshot().user?.fullName).toBe("New Person");
    });

    it("shows why sign-up failed, such as an email that is already registered", async () => {
        service.register.mockRejectedValue(new AxiosError("bad", "400", undefined, undefined, { data: { message: "Email is already registered. Try signing in instead." }, status: 400 } as never));
        renderPage(<CreateAccountPage />);

        fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "A" } });
        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.com" } });
        fireEvent.change(screen.getByLabelText("Password"), { target: { value: "long-enough-1" } });
        fireEvent.click(screen.getByRole("button", { name: "Create account" }));

        expect((await screen.findByRole("alert")).textContent).toContain("already registered");
    });
});
