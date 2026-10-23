import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePublicProductSearchStream } from "./product-discovery.hooks";

class FakeEventSource {
    static instances: FakeEventSource[] = [];
    url: string;
    closed = false;
    onerror: (() => void) | null = null;
    private listeners = new Map<string, (event: MessageEvent<string>) => void>();

    constructor(url: string) {
        this.url = url;
        FakeEventSource.instances.push(this);
    }

    addEventListener(name: string, listener: (event: MessageEvent<string>) => void) {
        this.listeners.set(name, listener);
    }

    close() {
        this.closed = true;
    }

    emit(name: string, data: unknown) {
        this.listeners.get(name)?.({ data: JSON.stringify(data) } as MessageEvent<string>);
    }
}

const latestStream = () => FakeEventSource.instances[FakeEventSource.instances.length - 1];

const serum = {
    productName: "Vitamin C Serum",
    price: 900,
    productUrl: "https://kireibd.com/serum",
    imageUrl: "",
    sourceWebsite: "kireibd.com"
};

describe("usePublicProductSearchStream", () => {
    beforeEach(() => {
        FakeEventSource.instances = [];
        vi.stubGlobal("EventSource", FakeEventSource);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("shows each store's results as they arrive and stops on done", () => {
        const { result } = renderHook(() => usePublicProductSearchStream());

        act(() => result.current.search("  vitamin c serum "));
        expect(latestStream().url).toContain("/api/v1/products/search/public/stream?query=vitamin+c+serum");
        expect(result.current.isSearching).toBe(true);

        act(() => latestStream().emit("start", { query: "vitamin c serum", sources: ["kireibd.com", "arogga.com"] }));
        act(() => latestStream().emit("source", { sourceWebsite: "kireibd.com", results: [serum] }));

        expect(result.current.results).toEqual([{ ...serum, storeKey: "kireibd.com" }]);
        expect(result.current.stores).toEqual([
            { sourceWebsite: "kireibd.com", status: "done", resultCount: 1 },
            { sourceWebsite: "arogga.com", status: "searching", resultCount: 0 }
        ]);

        act(() => latestStream().emit("done", {}));
        expect(result.current.isSearching).toBe(false);
        expect(latestStream().closed).toBe(true);
    });

    it("closes the stream on error instead of letting it reconnect, and keeps partial results", () => {
        const { result } = renderHook(() => usePublicProductSearchStream());

        act(() => result.current.search("serum"));
        act(() => latestStream().emit("start", { query: "serum", sources: ["kireibd.com", "arogga.com"] }));
        act(() => latestStream().emit("source", { sourceWebsite: "kireibd.com", results: [serum] }));
        act(() => latestStream().onerror?.());

        expect(latestStream().closed).toBe(true);
        expect(result.current.isSearching).toBe(false);
        expect(result.current.results).toHaveLength(1);
        expect(result.current.stores[1].status).toBe("failed");
        expect(result.current.error).toMatch(/connection dropped/);
    });

    it("closes the previous stream when a new search starts", () => {
        const { result } = renderHook(() => usePublicProductSearchStream());

        act(() => result.current.search("serum"));
        const first = latestStream();
        act(() => result.current.search("toner"));

        expect(first.closed).toBe(true);
        expect(FakeEventSource.instances).toHaveLength(2);
        expect(result.current.query).toBe("toner");
    });
});
