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

type Props = {
  format: Format;
  data: PassData;
};

export const ExportStage = forwardRef<HTMLDivElement, Props>(function ExportStage(
  { format, data },
  ref,
) {
  const { w, h } = FORMATS[format];

  // The pass is the artwork. Each export is just the right variant at the
  // platform's aspect ratio, filling the frame on a dark backdrop so the
  // cream pass pops regardless of social feed background.
  const content =
    format === "x" ? (
      // Horizontal pass at 1200×680 scaled to fit 1600×900 with padding.
      <Pass data={data} width={1600} />
    ) : format === "linkedin" || format === "igpost" ? (
      // Square pass fills the square frame exactly.
      <SquarePass data={data} width={w} />
    ) : (
      // Vertical pass fills the IG story frame exactly.
      <VerticalPass data={data} width={w} />
    );

  return (
    <div
      ref={ref}
      style={{ width: w, height: h }}
      className="relative bg-[#0a0a0a] overflow-hidden flex items-center justify-center"
    >
      {content}
    </div>
  );
});
