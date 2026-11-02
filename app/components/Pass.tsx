"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  HackTheFeedTitle,
  ParisCreatorWeekMark,
  PartnerRow,
} from "./Brand";

export type PassData = {
  name: string;
  role: string;
  team: string;
  building: string;
  track: "Video Search" | "Editorial";
  photo: string | null;
  photoScale: number;
  photoX: number;
  photoY: number;
};

type Variant = "horizontal" | "square" | "vertical";
type ScaledProps = { data: PassData; width: number };

export const H_BASE = { w: 1200, h: 540 };
export const S_BASE = { w: 1080, h: 1000 };
export const V_BASE = { w: 960, h: 1500 };

export function Pass({ data, width }: ScaledProps) {
  return (
    <ScaledContainer width={width} base={H_BASE}>
      <HorizontalPassContent data={data} />
    </ScaledContainer>
  );
}
export function SquarePass({ data, width }: ScaledProps) {
  return (
    <ScaledContainer width={width} base={S_BASE}>
      <SquarePassContent data={data} />
    </ScaledContainer>
  );
}
export function VerticalPass({ data, width }: ScaledProps) {
  return (
    <ScaledContainer width={width} base={V_BASE}>
      <VerticalPassContent data={data} />
    </ScaledContainer>
  );
}

function ScaledContainer({
  width,
  base,
  children,
}: {
  width: number;
  base: { w: number; h: number };
  children: ReactNode;
}) {
  const scale = width / base.w;
  const outerStyle: CSSProperties = { width, height: base.h * scale };
  const innerStyle: CSSProperties = {
    width: base.w,
    height: base.h,
    transform: `scale(${scale})`,
    transformOrigin: "top left",
  };
  return (
    <div style={outerStyle}>
      <div style={innerStyle}>{children}</div>
    </div>
  );
}

// ———————————————————————————————————————————————
// Palette
// ———————————————————————————————————————————————
const CREAM = "#f3efe6";
const INK = "#0a0a0a";
const STUB_CREAM = CREAM;
const CARD_SHADOW =
  "0 10px 30px rgba(10,10,10,0.14), 0 2px 6px rgba(10,10,10,0.06)";

type FieldWeight = "regular" | "medium" | "semibold";

function Field({
  label,
  value,
  placeholder,
  valueSize,
  labelSize,
  weight = "regular",
}: {
  label: string;
  value: string;
  placeholder?: string;
  valueSize: number;
  labelSize: number;
  weight?: FieldWeight;
}) {
  const isEmpty = !value;
  const display = value || placeholder || "—";
  const weightNum = weight === "semibold" ? 600 : weight === "medium" ? 500 : 400;
  const valueColor = isEmpty
    ? "text-[#0a0a0a]/35 italic"
    : weight === "semibold"
    ? "text-[#0a0a0a]"
    : "text-[#0a0a0a]/85";
  return (
    <div className="flex flex-col" style={{ gap: 5 }}>
      <div
        className="font-mono uppercase text-[#0a0a0a]/55"
        style={{
          fontSize: labelSize,
          fontWeight: 400,
          letterSpacing: "0.14em",
        }}
      >
        {label}
      </div>
      <div
        className={`${valueColor} leading-[1.2] tracking-tight`}
        style={{ fontSize: valueSize, fontWeight: weightNum }}
      >
        {display}
      </div>
    </div>
  );
}

function Barcode({
  seed,
  height,
  count,
  thickness = 2,
}: {
  seed: string;
  height: number;
  count: number;
  thickness?: number;
}) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    bars.push(((h >>> 16) % 4) + 1);
  }
  return (
    <div className="flex items-end gap-[2px]" style={{ height }}>
      {bars.map((w, i) => (
        <div
          key={i}
          style={{
            width: w * thickness,
            height: "100%",
            backgroundColor: INK,
          }}
        />
      ))}
    </div>
  );
}

function PhotoPlaceholder() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ backgroundColor: "#ebe7dd" }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-[52%] h-[52%]"
        fill="none"
        stroke="#9a9387"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx={50} cy={40} r={14} />
        <path d="M 24 86 Q 24 60 50 60 Q 76 60 76 86" />
      </svg>
    </div>
  );
}

function PhotoFrame({
  data,
  style,
}: {
  data: PassData;
  style?: CSSProperties;
}) {
  const photoStyle: CSSProperties = data.photo
    ? {
        backgroundImage: `url(${data.photo})`,
        backgroundSize: `${data.photoScale * 100}%`,
        backgroundPosition: `${50 + data.photoX}% ${50 + data.photoY}%`,
        backgroundRepeat: "no-repeat",
      }
    : {};
  return (
    <div
      className="relative overflow-hidden rounded-sm shrink-0"
      style={{ backgroundColor: "#ebe7dd", ...style }}
    >
      {data.photo ? (
        <div className="absolute inset-0" style={photoStyle} />
      ) : (
        <PhotoPlaceholder />
      )}
      <div
        className="absolute left-3 bottom-3 bg-[#f3efe6]/95 text-[#0a0a0a]/80 px-2 py-[3px] text-[10px] uppercase font-mono"
        style={{ letterSpacing: "0.14em", fontWeight: 400 }}
      >
        Builder · Paris
      </div>
    </div>
  );
}

// Boarding-pass header on cream main surface. No HTF artwork here — it lives
// in the detachable stub as the event brand panel. Header is: "BUILDER
// BOARDING PASS" title + the AI video search tagline + PCW endorsement.
function BoardingHeader({
  titleSize,
  subtitleSize,
  pcwSize,
  endorsementSize,
}: {
  titleSize: number;
  subtitleSize: number;
  pcwSize: number;
  endorsementSize: number;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex flex-col gap-1 min-w-0">
        <div
          className="font-mono uppercase text-[#0a0a0a]/55"
          style={{
            fontSize: titleSize,
            fontWeight: 400,
            letterSpacing: "0.22em",
          }}
        >
          Builder Boarding Pass
        </div>
        <div
          className="leading-[1.15] text-[#0a0a0a] tracking-tight"
          style={{ fontSize: subtitleSize, fontWeight: 500 }}
        >
          The AI video search hackathon.
        </div>
      </div>
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <ParisCreatorWeekMark height={pcwSize} color={INK} />
        <div
          className="font-mono uppercase text-[#0a0a0a]/55 whitespace-nowrap"
          style={{
            fontSize: endorsementSize,
            fontWeight: 400,
            letterSpacing: "0.12em",
          }}
        >
          Official side event
        </div>
      </div>
    </div>
  );
}

// HTF event brand mark — placed directly on the cream stub with no frame or
// background panel, so the artwork reads as a mark rather than a card.
function HTFEventPanel({
  size,
  style,
}: {
  size: number;
  style?: CSSProperties;
}) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={style}
    >
      <HackTheFeedTitle size={size} />
    </div>
  );
}

// ———————————————————————————————————————————————
// VARIANT 1 — HORIZONTAL · 1200 × 540
// Main (cream) 74% + Stub (lime) 26% — vertical perforation
// ———————————————————————————————————————————————
function HorizontalPassContent({ data }: { data: PassData }) {
  const name = data.name || "Your name";
  const team = data.team || "—";
  const role = data.role || "—";
  const building =
    data.building || "One clear sentence about what you're building.";
  const PERF_X = 888;
  return (
    <div
      className="relative w-full h-full font-sans overflow-hidden"
      style={{
        backgroundColor: CREAM,
        borderRadius: 18,
        boxShadow: CARD_SHADOW,
      }}
    >
      {/* Stub bg: cream — same tone as main; perforation alone provides the
          visual split, no decorative strip. */}
      <div
        className="absolute"
        style={{
          backgroundColor: STUB_CREAM,
          left: PERF_X,
          top: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Perforation + cutouts */}
      <div
        className="absolute w-10 h-10 rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ left: PERF_X, top: 0, backgroundColor: INK }}
      />
      <div
        className="absolute w-10 h-10 rounded-full -translate-x-1/2 translate-y-1/2"
        style={{ left: PERF_X, bottom: 0, backgroundColor: INK }}
      />
      <div
        className="absolute w-px"
        style={{
          left: PERF_X,
          top: 28,
          bottom: 28,
          borderLeft: `1px dashed ${INK}`,
          opacity: 0.3,
        }}
      />

      {/* MAIN · cream · 0 → 888 */}
      <div
        className="absolute flex flex-col"
        style={{
          left: 32,
          top: 28,
          bottom: 28,
          right: 1200 - PERF_X + 28,
          rowGap: 18,
        }}
      >
        <BoardingHeader
          titleSize={10}
          subtitleSize={16}
          pcwSize={56}
          endorsementSize={10}
        />

        <div
          className="grid gap-6 flex-1 min-h-0"
          style={{ gridTemplateColumns: "230px 1fr" }}
        >
          <PhotoFrame data={data} style={{ width: 230, height: 230 }} />
          <div className="flex flex-col" style={{ gap: 14 }}>
            <Field
              label="Passenger"
              value={name}
              placeholder="Your name"
              labelSize={10}
              valueSize={38}
              weight="semibold"
            />
            <div className="grid grid-cols-2" style={{ gap: 8 }}>
              <Field label="Team" value={team} labelSize={9} valueSize={16} />
              <Field label="Role" value={role} labelSize={9} valueSize={16} />
            </div>
            <Field
              label="Building"
              value={building}
              placeholder="One clear sentence about what you're building."
              labelSize={9}
              valueSize={20}
              weight="medium"
            />
          </div>
        </div>

        {/* Partners inline on cream — no separate strip needed */}
        <div
          className="pt-3 flex flex-col gap-2"
          style={{ borderTop: `1px solid ${INK}1f` }}
        >
          <div
            className="font-mono uppercase text-[#0a0a0a]/55"
            style={{ fontSize: 9, letterSpacing: "0.22em", fontWeight: 400 }}
          >
            In partnership with
          </div>
          <PartnerRow size={26} color={INK} gap={28} wrap={false} />
        </div>
      </div>

      {/* STUB · lime · 888 → 1200 */}
      <div
        className="absolute flex flex-col"
        style={{
          left: PERF_X + 36,
          top: 28,
          bottom: 28,
          right: 24,
          rowGap: 16,
        }}
      >
        <HTFEventPanel size={118} style={{ height: 140 }} />

        <div style={{ borderTop: `1px solid ${INK}1f` }} />

        <div className="flex flex-col" style={{ gap: 10 }}>
          <Field label="Date" value="Sat · 7 Nov 2026" labelSize={10} valueSize={16} />
          <Field label="Event Hours" value="10:00 — 17:00" labelSize={10} valueSize={16} />
          <Field label="Track" value={data.track} labelSize={10} valueSize={16} />
        </div>

        <div className="mt-auto flex flex-col gap-1.5">
          <Barcode
            seed={name + team + data.track}
            height={32}
            count={28}
            thickness={1.7}
          />
          <div
            className="font-mono uppercase text-[#0a0a0a]/55"
            style={{ fontSize: 9, letterSpacing: "0.22em", fontWeight: 400 }}
          >
            HTF · 7.11.26
          </div>
        </div>
      </div>
    </div>
  );
}

// ———————————————————————————————————————————————
// VARIANT 2 — SQUARE · 1080 × 1000
// Main (cream) 76% + Stub (lime) 24%
// Project moved directly below Destination in identity column to fill space.
// ———————————————————————————————————————————————
function SquarePassContent({ data }: { data: PassData }) {
  const name = data.name || "Your name";
  const team = data.team || "—";
  const role = data.role || "—";
  const building =
    data.building || "One clear sentence about what you're building.";
  const PERF_Y = 760;
  return (
    <div
      className="relative w-full h-full font-sans overflow-hidden"
      style={{
        backgroundColor: CREAM,
        borderRadius: 18,
        boxShadow: CARD_SHADOW,
      }}
    >
      <div
        className="absolute"
        style={{
          backgroundColor: STUB_CREAM,
          left: 0,
          right: 0,
          top: PERF_Y,
          bottom: 0,
        }}
      />
      <div
        className="absolute w-12 h-12 rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ left: 0, top: PERF_Y, backgroundColor: INK }}
      />
      <div
        className="absolute w-12 h-12 rounded-full translate-x-1/2 -translate-y-1/2"
        style={{ right: 0, top: PERF_Y, backgroundColor: INK }}
      />
      <div
        className="absolute h-px"
        style={{
          left: 36,
          right: 36,
          top: PERF_Y,
          borderTop: `1px dashed ${INK}`,
          opacity: 0.3,
        }}
      />

      {/* MAIN · 0 → 760 */}
      <div
        className="absolute flex flex-col"
        style={{ left: 44, right: 44, top: 44, bottom: 1000 - PERF_Y + 32, rowGap: 20 }}
      >
        <BoardingHeader
          titleSize={11}
          subtitleSize={22}
          pcwSize={68}
          endorsementSize={11}
        />

        {/* Portrait + identity column — tighter gaps so the right column fills
            the full height of the 300px photo without a hollow middle. */}
        <div
          className="grid gap-7 flex-1 min-h-0"
          style={{ gridTemplateColumns: "300px 1fr" }}
        >
          <PhotoFrame data={data} style={{ width: 300, height: 300 }} />
          <div className="flex flex-col justify-between py-1" style={{ gap: 14 }}>
            <Field
              label="Passenger"
              value={name}
              placeholder="Your name"
              labelSize={10}
              valueSize={54}
              weight="semibold"
            />
            <div className="grid grid-cols-2" style={{ gap: 12 }}>
              <Field label="Team" value={team} labelSize={10} valueSize={18} />
              <Field label="Role" value={role} labelSize={10} valueSize={18} />
            </div>
            <Field
              label="Destination"
              value="Hack the Feed · Paris"
              labelSize={10}
              valueSize={18}
            />
            <Field
              label="Building"
              value={building}
              placeholder="One clear sentence about what you're building."
              labelSize={10}
              valueSize={28}
              weight="medium"
            />
          </div>
        </div>

        <div
          className="pt-3 flex flex-col gap-2"
          style={{ borderTop: `1px solid ${INK}1f` }}
        >
          <div
            className="font-mono uppercase text-[#0a0a0a]/55"
            style={{ fontSize: 10, letterSpacing: "0.22em", fontWeight: 400 }}
          >
            In partnership with
          </div>
          <PartnerRow size={30} color={INK} gap={34} wrap={false} />
        </div>
      </div>

      {/* STUB · 760 → 1000 */}
      <div
        className="absolute flex items-stretch gap-10"
        style={{ left: 44, right: 44, top: PERF_Y + 24, bottom: 32 }}
      >
        <HTFEventPanel size={170} style={{ height: 200, width: 300 }} />

        <div className="w-px shrink-0" style={{ backgroundColor: `${INK}1f` }} />

        <div className="flex-1 flex flex-col justify-between py-1 gap-4">
          <div className="grid grid-cols-3 gap-5">
            <Field label="Date" value="Sat · 7 Nov 2026" labelSize={10} valueSize={20} />
            <Field label="Event Hours" value="10:00 — 17:00" labelSize={10} valueSize={20} />
            <Field label="Track" value={data.track} labelSize={10} valueSize={20} />
          </div>
          <div className="flex items-end justify-between gap-6">
            <div
              className="font-mono uppercase text-[#0a0a0a]/55"
              style={{ fontSize: 10, letterSpacing: "0.22em", fontWeight: 400 }}
            >
              HTF · PAR · 7.11.26
            </div>
            <Barcode
              seed={name + team + data.track}
              height={36}
              count={38}
              thickness={1.9}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ———————————————————————————————————————————————
// VARIANT 3 — VERTICAL · 960 × 1500 — Vertical stack with 2-column stub
// Main (cream) 82% + Stub (lime) 18%
// ———————————————————————————————————————————————
function VerticalPassContent({ data }: { data: PassData }) {
  const name = data.name || "Your name";
  const team = data.team || "—";
  const role = data.role || "—";
  const building =
    data.building || "One clear sentence about what you're building.";
  const PERF_Y = 1230;
  return (
    <div
      className="relative w-full h-full font-sans overflow-hidden"
      style={{
        backgroundColor: CREAM,
        borderRadius: 18,
        boxShadow: CARD_SHADOW,
      }}
    >
      <div
        className="absolute"
        style={{
          backgroundColor: STUB_CREAM,
          left: 0,
          right: 0,
          top: PERF_Y,
          bottom: 0,
        }}
      />
      <div
        className="absolute w-12 h-12 rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ left: 0, top: PERF_Y, backgroundColor: INK }}
      />
      <div
        className="absolute w-12 h-12 rounded-full translate-x-1/2 -translate-y-1/2"
        style={{ right: 0, top: PERF_Y, backgroundColor: INK }}
      />
      <div
        className="absolute h-px"
        style={{
          left: 36,
          right: 36,
          top: PERF_Y,
          borderTop: `1px dashed ${INK}`,
          opacity: 0.3,
        }}
      />

      {/* MAIN CONTENT · 0 → (PERF_Y - PARTNER_BAND_H) · 1090 */}
      <div
        className="absolute flex flex-col"
        style={{
          left: 44,
          right: 44,
          top: 44,
          bottom: 1500 - PERF_Y + 150,
          rowGap: 22,
        }}
      >
        <BoardingHeader
          titleSize={13}
          subtitleSize={30}
          pcwSize={92}
          endorsementSize={12}
        />

        <div style={{ borderTop: `1px solid ${INK}1f` }} />

        <div className="flex justify-center">
          <PhotoFrame data={data} style={{ width: 420, height: 420 }} />
        </div>

        <Field
          label="Passenger"
          value={name}
          placeholder="Your name"
          labelSize={12}
          valueSize={60}
          weight="semibold"
        />
        <div className="grid grid-cols-2" style={{ gap: 24 }}>
          <Field label="Team" value={team} labelSize={11} valueSize={24} />
          <Field label="Role" value={role} labelSize={11} valueSize={24} />
        </div>
        <Field
          label="Destination"
          value="Hack the Feed · Paris"
          labelSize={11}
          valueSize={24}
        />
        <Field
          label="Building"
          value={building}
          placeholder="One clear sentence about what you're building."
          labelSize={12}
          valueSize={30}
          weight="medium"
        />
      </div>

      {/* DEDICATED PARTNER BAND · 1090 → 1230 (140px) · 24px pad T/B */}
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{
          left: 44,
          right: 44,
          top: PERF_Y - 140,
          height: 140,
          paddingTop: 24,
          paddingBottom: 24,
          gap: 14,
        }}
      >
        <div
          className="font-mono uppercase text-[#0a0a0a]/55"
          style={{ fontSize: 12, letterSpacing: "0.22em", fontWeight: 400 }}
        >
          In partnership with
        </div>
        <PartnerRow size={38} color={INK} gap={44} wrap={false} />
      </div>

      {/* STUB · 1230 → 1500 — 2 readable columns */}
      <div
        className="absolute grid items-stretch gap-10"
        style={{
          left: 44,
          right: 44,
          top: PERF_Y + 28,
          bottom: 32,
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        <HTFEventPanel size={200} style={{ height: 240, width: 360 }} />

        <div
          className="flex flex-col justify-between gap-4 border-l pl-10"
          style={{ borderColor: `${INK}1f` }}
        >
          <div className="flex flex-col gap-4">
            <Field label="Date" value="Sat · 7 Nov 2026" labelSize={11} valueSize={24} />
            <Field label="Event Hours" value="10:00 — 17:00" labelSize={11} valueSize={24} />
            <Field label="Track" value={data.track} labelSize={11} valueSize={24} />
          </div>
          <div className="flex items-end justify-between gap-4">
            <div
              className="font-mono uppercase text-[#0a0a0a]/55"
              style={{ fontSize: 10, letterSpacing: "0.22em", fontWeight: 400 }}
            >
              HTF · 7.11.26
            </div>
            <Barcode
              seed={name + team + data.track}
              height={44}
              count={28}
              thickness={2.2}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export type { Variant };
