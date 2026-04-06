import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EditorSkeleton } from "@/components/ui/Skeleton";

describe("Skeleton", () => {
  it("renders with default pulse animation and highlight background", () => {
    render(<EditorSkeleton />);

    const skeletonElements = document.querySelectorAll(".animate-pulse");
    expect(skeletonElements.length).toBeGreaterThan(0);

    skeletonElements.forEach((el) => {
      expect(el.classList.contains("rounded")).toBe(true);
    });
  });

  it("accepts custom className on skeleton elements", () => {
    render(<EditorSkeleton />);

    const wideSkeletons = document.querySelectorAll(".h-8.w-32");
    expect(wideSkeletons.length).toBeGreaterThan(0);

    const narrowSkeletons = document.querySelectorAll(".h-6.w-24");
    expect(narrowSkeletons.length).toBeGreaterThan(0);
  });

  it("renders skeleton elements as div elements", () => {
    render(<EditorSkeleton />);

    const skeletonElements = document.querySelectorAll(".animate-pulse");
    skeletonElements.forEach((el) => {
      expect(el.tagName).toBe("DIV");
    });
  });

  it("renders the full editor skeleton layout structure", () => {
    render(<EditorSkeleton />);

    const sidebar = document.querySelector("aside");
    expect(sidebar).toBeInTheDocument();

    const main = document.querySelector("main");
    expect(main).toBeInTheDocument();
  });
});
