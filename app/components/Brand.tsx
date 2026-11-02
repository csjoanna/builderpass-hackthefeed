"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";

type TitleProps = {
  size: number;
  alt?: string;
};

// The real Hack the Feed chrome mark, extracted from the official artwork.
export function HackTheFeedTitle({ size, alt = "Hack the Feed" }: TitleProps) {
  // The source image is roughly 1070x1030 (approx square). Size here is the
  // rendered width in px; height auto-scales via object-contain.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/hack-the-feed-mark.png"
      alt={alt}
      style={{ width: size, maxWidth: "100%", height: "auto" }}
      className="block select-none"
      crossOrigin="anonymous"
      draggable={false}
    />
  );
}

// Partner wordmarks sourced from each brand's official SVG where available,
// patched to use currentColor so the pass controls hue.
function LogoImg({
  src,
  alt,
  height,
  color,
  mode = "mono",
}: {
  src: string;
  alt: string;
  height: number;
  color?: string;
  mode?: "mono" | "full";
}) {
  const style: CSSProperties = {
    height,
    width: "auto",
    color: mode === "mono" ? color ?? "currentColor" : undefined,
  };
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      style={style}
      className="block select-none"
      crossOrigin="anonymous"
      draggable={false}
    />
  );
}

export function OrianeMark({
  height = 18,
  color,
}: {
  height?: number;
  color?: string;
}) {
  return (
    <LogoImg
      src="/logos/oriane.svg"
      alt="Oriane"
      height={height}
      color={color}
    />
  );
}

export function LovableMark({ height = 20 }: { height?: number }) {
  // Lovable's wordmark is multi-colored; render as-is.
  return <LogoImg src="/logos/lovable.svg" alt="Lovable" height={height} mode="full" />;
}

// Albert School — inline SVG wordmark that matches the real logo:
// a large pale-blue disc with a small navy dot overlapping its lower-left,
// followed by heavy "ALBERT" + light "SCHOOL" at matching height.
// Text + small dot use currentColor so parents can switch between navy on
// light backgrounds and cream on dark backgrounds; the pale-blue disc stays
// the brand hue in all contexts.
export function AlbertSchoolMark({
  height = 20,
  color,
  circleColor = "#A8CFEE",
}: {
  height?: number;
  color?: string;
  circleColor?: string;
}) {
  // Prefer the official PNG, then SVG, then inline fallback. Dropping either
  // file into public/logos/ wires it up automatically.
  const [stage, setStage] = useState<"png" | "svg" | "inline">("png");
  if (stage !== "inline") {
    const src =
      stage === "png" ? "/logos/albert-school.png" : "/logos/albert-school.svg";
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt="Albert School"
        onError={() => setStage(stage === "png" ? "svg" : "inline")}
        style={{ height, width: "auto", display: "block" }}
        className="select-none"
        crossOrigin="anonymous"
        draggable={false}
      />
    );
  }

  // Inline fallback — pale-blue disc + navy satellite dot + wordmark.
  const VB_W = 860;
  const VB_H = 130;
  const width = (height * VB_W) / VB_H;
  const ink = color ?? "#121A3A";
  const fontFamily =
    "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif";
  return (
    <svg
      role="img"
      aria-label="Albert School"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={width}
      height={height}
      style={{ display: "block" }}
    >
      <circle cx={65} cy={62} r={55} fill={circleColor} />
      <circle cx={22} cy={96} r={14} fill={ink} />
      <text
        x={150}
        y={90}
        fill={ink}
        fontFamily={fontFamily}
        fontSize={78}
        fontWeight={900}
        letterSpacing="-2.5"
      >
        ALBERT
        <tspan fontWeight={300} dx="10" letterSpacing="0.5">
          SCHOOL
        </tspan>
      </text>
    </svg>
  );
}

export function BrutMark({
  height = 20,
  color,
}: {
  height?: number;
  color?: string;
}) {
  return (
    <LogoImg src="/logos/brut.svg" alt="Brut." height={height} color={color} />
  );
}

// Paris Creator Week — stacked thin outline wordmark.
// Optional `boxed` variant draws a thin frame around the mark and adds
// an "OFFICIAL SIDE EVENT" subtitle, mirroring the official banner artwork.
export function ParisCreatorWeekMark({
  height = 24,
  color,
  boxed = false,
}: {
  height?: number;
  color?: string;
  boxed?: boolean;
}) {
  const VB_W = boxed ? 260 : 220;
  const VB_H = boxed ? 180 : 130;
  const width = (height * VB_W) / VB_H;
  const fontFamily =
    "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif";
  return (
    <svg
      role="img"
      aria-label="Paris Creator Week · Official Side Event"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={width}
      height={height}
      style={{ color: color ?? "currentColor", display: "block" }}
    >
      {boxed && (
        <rect
          x={10}
          y={10}
          width={VB_W - 20}
          height={120}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
        />
      )}
      <g
        fill="currentColor"
        fontFamily={fontFamily}
        fontWeight={300}
        letterSpacing="2"
        textAnchor="middle"
      >
        <text x={VB_W / 2} y={boxed ? 48 : 38} fontSize={34}>PARIS</text>
        <text x={VB_W / 2} y={boxed ? 88 : 78} fontSize={34}>CREATOR</text>
        <text x={VB_W / 2} y={boxed ? 128 : 118} fontSize={34}>WEEK</text>
        {boxed && (
          <text
            x={VB_W / 2}
            y={166}
            fontSize={16}
            fontWeight={700}
            letterSpacing="3"
          >
            OFFICIAL SIDE EVENT
          </text>
        )}
      </g>
    </svg>
  );
}

export function PartnerRow({
  size = 20,
  color,
  gap = 28,
  separator,
  wrap = true,
}: {
  size?: number;
  color?: string;
  gap?: number;
  separator?: ReactNode;
  wrap?: boolean;
}) {
  const marks = [
    <OrianeMark key="o" height={size} color={color} />,
    <LovableMark key="l" height={size * 1.1} />,
    <AlbertSchoolMark key="a" height={size * 1.05} color={color} />,
    <BrutMark key="b" height={size * 1.1} color={color} />,
  ];
  return (
    <div
      className={`inline-flex items-center ${wrap ? "flex-wrap" : "flex-nowrap"}`}
      style={{ color, columnGap: gap, rowGap: gap / 2 }}
    >
      {marks.map((m, i) => (
        <span key={i} className="inline-flex items-center" style={{ gap }}>
          {m}
          {separator && i < marks.length - 1 && (
            <span style={{ opacity: 0.3 }}>{separator}</span>
          )}
        </span>
      ))}
    </div>
  );
}
