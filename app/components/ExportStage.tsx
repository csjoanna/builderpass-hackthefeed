"use client";

import { forwardRef } from "react";
import {
  Pass,
  SquarePass,
  VerticalPass,
  type PassData,
} from "./Pass";

export type Format = "x" | "linkedin" | "igpost" | "igstory";

export const FORMATS: Record<
  Format,
  { w: number; h: number; label: string; short: string; filename: string }
> = {
  x: {
    w: 1600,
    h: 900,
    label: "X post · 1600×900",
    short: "X post",
    filename: "hack-the-feed-x",
  },
  linkedin: {
    w: 1200,
    h: 1200,
    label: "LinkedIn · 1200×1200",
    short: "LinkedIn",
    filename: "hack-the-feed-linkedin",
  },
  igpost: {
    w: 1080,
    h: 1080,
    label: "Instagram post · 1080×1080",
    short: "IG post",
    filename: "hack-the-feed-ig-post",
  },
  igstory: {
    w: 1080,
    h: 1920,
    label: "Instagram story · 1080×1920",
    short: "IG story",
    filename: "hack-the-feed-ig-story",
  },
};

type Props = { format: Format; data: PassData };

// Each export is a dark canvas with the ticket centered inside. The dark
// margin becomes a deliberate design element rather than the ticket
// stretching awkwardly to fill the platform's aspect ratio.
export const ExportStage = forwardRef<HTMLDivElement, Props>(function ExportStage(
  { format, data },
  ref,
) {
  const { w, h } = FORMATS[format];

  // Pass width per format — tuned so the ticket sits as a compact object
  // with visible dark breathing room on every side.
  const passWidth =
    format === "x"
      ? 1400 // 1400 × 607 landscape ticket in 1600 × 900 canvas → margins ~100 L/R, ~146 T/B
      : format === "linkedin"
      ? 1080 // 1080 × 960 square ticket in 1200 × 1200 canvas → margins 60 L/R, 120 T/B
      : format === "igpost"
      ? 1000 // 1000 × 889 square-ish ticket in 1080 × 1080 canvas → margins 40 L/R, 95 T/B
      : 960; // 960 × 1500 vertical ticket in 1080 × 1920 canvas → margins 60 L/R, 210 T/B (safe for IG)

  const content =
    format === "x" ? (
      <Pass data={data} width={passWidth} />
    ) : format === "linkedin" || format === "igpost" ? (
      <SquarePass data={data} width={passWidth} />
    ) : (
      <VerticalPass data={data} width={passWidth} />
    );

  return (
    <div
      ref={ref}
      style={{ width: w, height: h }}
      className="relative bg-[#0a0a0a] overflow-hidden flex items-center justify-center"
    >
      <div className="shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] rounded-md">
        {content}
      </div>
    </div>
  );
});
