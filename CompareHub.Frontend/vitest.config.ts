import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./", import.meta.url)),
        },
    },
    // tsconfig keeps JSX as-is for Next.js, so tests need to compile .tsx components themselves.
    oxc: {
        jsx: { runtime: "automatic" },
    },
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: [],
        include: ["**/*.{test,spec}.{ts,tsx}"],
    },
});
