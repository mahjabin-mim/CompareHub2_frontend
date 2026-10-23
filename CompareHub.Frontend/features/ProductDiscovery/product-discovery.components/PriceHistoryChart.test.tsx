import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PriceHistoryChart } from "./PriceHistoryChart";

const day = (n: number) => Date.parse(`2026-10-${String(n).padStart(2, "0")}T00:00:00Z`);

describe("PriceHistoryChart", () => {
    it("explains that history needs a price change when there is nothing to draw", () => {
        render(<PriceHistoryChart series={[{ time: day(1), price: 1200 }]} />);

        expect(screen.getByText(/appears here after a store changes its price/)).toBeTruthy();
        expect(screen.queryByRole("img")).toBeNull();
    });

    it("draws the lowest-price line with an accessible description", () => {
        render(<PriceHistoryChart series={[{ time: day(1), price: 1200 }, { time: day(5), price: 990 }]} now={day(9)} />);

        const chart = screen.getByRole("img");
        expect(chart.getAttribute("aria-label")).toContain("৳1,200");
        expect(chart.getAttribute("aria-label")).toContain("now ৳990");
        expect(chart.querySelector("path")?.getAttribute("d")).toMatch(/^M/);
        expect(screen.getByText(/low ৳990/)).toBeTruthy();
    });
});
