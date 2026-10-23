import { beforeEach, describe, expect, it } from "vitest";
import {
    addRecentSearch,
    buildSearchUrl,
    getQueryFromUrl,
    loadRecentSearches,
    saveRecentSearches
} from "./product-discovery.recent-searches";

describe("addRecentSearch", () => {
    it("puts the newest search first and drops duplicates ignoring case and spacing", () => {
        expect(addRecentSearch(["toner", "Sunscreen"], "  sunscreen ")).toEqual(["sunscreen", "toner"]);
    });

    it("keeps only the six most recent and ignores blank searches", () => {
        const six = ["a1", "b2", "c3", "d4", "e5", "f6"];

        expect(addRecentSearch(six, "g7")).toEqual(["g7", "a1", "b2", "c3", "d4", "e5"]);
        expect(addRecentSearch(six, "   ")).toBe(six);
    });
});

describe("recent searches storage", () => {
    beforeEach(() => localStorage.clear());

    it("round-trips and tolerates corrupt data", () => {
        saveRecentSearches(["toner"]);
        expect(loadRecentSearches()).toEqual(["toner"]);

        localStorage.setItem("comparehub_recent_searches", "{not json");
        expect(loadRecentSearches()).toEqual([]);
        localStorage.setItem("comparehub_recent_searches", JSON.stringify([1, "ok"]));
        expect(loadRecentSearches()).toEqual(["ok"]);
    });
});

describe("search URLs", () => {
    it("reads and builds the q parameter", () => {
        expect(getQueryFromUrl("?q=vitamin%20c%20serum")).toBe("vitamin c serum");
        expect(getQueryFromUrl("")).toBe("");
        expect(buildSearchUrl("/", "vitamin c serum")).toBe("/?q=vitamin+c+serum");
        expect(buildSearchUrl("/", "  ")).toBe("/");
    });
});
