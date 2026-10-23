import { createElement } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductImage } from "./ProductImage";

describe("ProductImage", () => {
    it("shows the store name instead of a broken image", () => {
        render(createElement(ProductImage, { src: "https://example.com/missing.jpg", alt: "Serum", fallbackLabel: "kireibd.com" }));

        fireEvent.error(screen.getByAltText("Serum"));

        expect(screen.queryByAltText("Serum")).toBeNull();
        expect(screen.getByText("kireibd.com")).toBeTruthy();
    });

    it("shows the store name when there is no image at all", () => {
        render(createElement(ProductImage, { src: "", alt: "Serum", fallbackLabel: "arogga.com" }));

        expect(screen.getByText("arogga.com")).toBeTruthy();
    });
});
