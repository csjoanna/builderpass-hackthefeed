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
    <div style={outerStyle} className="overflow-hidden">
      <div style={innerStyle}>{children}</div>
    </div>
  );
}

// ———————————————————————————————————————————————
// Palette
// ———————————————————————————————————————————————
const CREAM = "#f3efe6";
const INK = "#0a0a0a";
// Stub surface: solid cream (same tone as main) with a narrow iridescent
// accent strip at the perforation edge. All stub information renders on
// the calm cream panel. When a dedicated lettering-free HTF texture asset
// is provided, swap the accent for that image.
const STUB_CREAM = CREAM;
const IRIDESCENT_STRIP =
  "linear-gradient(90deg, #ff6b9d 0%, #c084fc 25%, #7dd3fc 55%, #a3e635 80%, #fde047 100%)";

// All text in both main pass (cream) and stub (lime) is INK, so the Field
// component uses one color scheme throughout.
function Field({
  label,
  value,
  placeholder,
  valueSize,
  labelSize,
  dim,
}: {
  label: string;
  value: string;
  placeholder?: string;
  valueSize: number;
  labelSize: number;
  dim?: boolean;
}) {
  const isEmpty = !value;
  const display = value || placeholder || "—";
  return (
    <div className="flex flex-col" style={{ gap: 6 }}>
      <div
        className="font-mono tracking-[0.2em] uppercase text-[#0a0a0a]/75 font-bold"
        style={{ fontSize: labelSize }}
      >
        {label}
      </div>
      <div
        className={`${
          isEmpty
            ? "text-[#0a0a0a]/35 italic font-normal"
            : dim
            ? "text-[#0a0a0a]/85 font-semibold"
            : "text-[#0a0a0a] font-black"
        } leading-[1.15] tracking-tight`}
        style={{ fontSize: valueSize }}
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
    <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-[62%] h-[62%]" aria-hidden>
        <circle cx={50} cy={50} r={50} fill="#9ca3af" />
        <circle cx={50} cy={40} r={14} fill="#f3f4f6" />
        <path
          d="M 22 86 Q 22 60 50 60 Q 78 60 78 86 L 78 100 L 22 100 Z"
          fill="#f3f4f6"
        />
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
      style={{ backgroundColor: INK, ...style }}
    >
      {data.photo ? (
        <div className="absolute inset-0 bg-neutral-800" style={photoStyle} />
      ) : (
        <PhotoPlaceholder />
      )}
      <div className="absolute left-3 bottom-3 bg-[#f3efe6] text-[#0a0a0a] px-2 py-1 text-[10px] font-bold tracking-[0.2em] uppercase border border-[#0a0a0a]">
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
          className="font-mono font-bold tracking-[0.35em] uppercase text-[#0a0a0a]/75"
          style={{ fontSize: titleSize }}
        >
          Builder Boarding Pass
        </div>
        <div
          className="font-black leading-[1.1] text-[#0a0a0a] tracking-tight"
          style={{ fontSize: subtitleSize }}
        >
          The AI video search hackathon.
        </div>
      </div>
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <ParisCreatorWeekMark height={pcwSize} color={INK} />
        <div
          className="font-mono tracking-[0.1em] uppercase text-[#0a0a0a]/55 whitespace-nowrap"
          style={{ fontSize: endorsementSize }}
        >
          Official side event
        </div>
      </div>
    </div>
  );
}

// HTF event brand panel — rendered inside the stub on a black background so
// the artwork sits on its native dark surface instead of floating.
function HTFEventPanel({
  size,
  style,
}: {
  size: number;
  style?: CSSProperties;
}) {
  return (
    <div
      className="relative flex items-center justify-center overflow-hidden rounded-sm"
      style={{ backgroundColor: INK, ...style }}
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
      className="relative w-full h-full font-sans rounded-3xl overflow-hidden"
      style={{ backgroundColor: CREAM }}
    >
      {/* Stub bg: cream (same tone as main, perforation + narrow iridescent
          accent provide visual separation without a busy background texture) */}
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
      {/* Narrow iridescent accent along the stub's inner edge */}
      <div
        className="absolute"
        style={{
          left: PERF_X + 10,
          top: 28,
          bottom: 28,
          width: 6,
          background: IRIDESCENT_STRIP,
          borderRadius: 3,
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
          borderLeft: `2px dashed ${INK}`,
          opacity: 0.4,
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
          endorsementSize={19}
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
              labelSize={11}
              valueSize={38}
            />
            <div className="grid grid-cols-2" style={{ gap: 8 }}>
              <Field
                label="Team"
                value={team}
                labelSize={10}
                valueSize={16}
                dim
              />
              <Field
                label="Role"
                value={role}
                labelSize={10}
                valueSize={16}
                dim
              />
            </div>
            <Field
              label="Building"
              value={building}
              placeholder="One clear sentence about what you're building."
              labelSize={10}
              valueSize={20}
            />
          </div>
        </div>

        {/* Partners inline on cream — no separate strip needed */}
        <div className="pt-3 border-t border-[#0a0a0a]/15 flex flex-col gap-2">
          <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#0a0a0a]/60">
            In partnership with
          </div>
          <PartnerRow size={29} color={INK} gap={32} wrap={false} />
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
        <HTFEventPanel size={110} style={{ height: 140 }} />

        <div className="border-t" style={{ borderColor: `${INK}30` }} />

        <div className="flex flex-col" style={{ gap: 10 }}>
          <Field label="Date" value="Sat · 7 Nov 2026" labelSize={11} valueSize={18} />
          <Field label="Event Hours" value="10:00 — 17:00" labelSize={11} valueSize={18} />
          <Field label="Track" value={data.track} labelSize={11} valueSize={18} />
        </div>

        <div className="mt-auto flex flex-col gap-1.5">
          <Barcode
            seed={name + team + data.track}
            height={32}
            count={28}
            thickness={1.7}
          />
          <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#0a0a0a]/60 font-bold">
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
      className="relative w-full h-full font-sans rounded-3xl overflow-hidden"
      style={{ backgroundColor: CREAM }}
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
      {/* Narrow iridescent accent strip along the top of the stub */}
      <div
        className="absolute"
        style={{
          left: 36,
          right: 36,
          top: PERF_Y + 14,
          height: 6,
          background: IRIDESCENT_STRIP,
          borderRadius: 3,
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
          borderTop: `2px dashed ${INK}`,
          opacity: 0.4,
        }}
      />

      {/* MAIN · 0 → 760 */}
      <div
        className="absolute flex flex-col"
        style={{ left: 44, right: 44, top: 44, bottom: 1000 - PERF_Y + 32, rowGap: 20 }}
      >
        <BoardingHeader
          titleSize={11}
          subtitleSize={20}
          pcwSize={68}
          endorsementSize={15}
        />

        {/* Portrait + identity column that fills the empty space beside photo */}
        <div
          className="grid gap-7 flex-1 min-h-0"
          style={{ gridTemplateColumns: "300px 1fr" }}
        >
          <PhotoFrame data={data} style={{ width: 300, height: 300 }} />
          <div className="flex flex-col" style={{ gap: 16 }}>
            <Field
              label="Passenger"
              value={name}
              placeholder="Your name"
              labelSize={11}
              valueSize={56}
            />
            <div className="grid grid-cols-2" style={{ gap: 12 }}>
              <Field label="Team" value={team} labelSize={11} valueSize={20} dim />
              <Field label="Role" value={role} labelSize={11} valueSize={20} dim />
            </div>
            <Field
              label="Destination"
              value="Hack the Feed · Paris"
              labelSize={11}
              valueSize={20}
              dim
            />
            <Field
              label="Building"
              value={building}
              placeholder="One clear sentence about what you're building."
              labelSize={11}
              valueSize={30}
            />
          </div>
        </div>

        <div className="pt-3 border-t border-[#0a0a0a]/15 flex flex-col gap-2">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#0a0a0a]/60">
            In partnership with
          </div>
          <PartnerRow size={34} color={INK} gap={38} wrap={false} />
        </div>
      </div>

      {/* STUB · 760 → 1000 */}
      <div
        className="absolute flex items-stretch gap-10"
        style={{ left: 44, right: 44, top: PERF_Y + 24, bottom: 32 }}
      >
        <HTFEventPanel size={150} style={{ height: 200, width: 300 }} />

        <div className="w-px shrink-0" style={{ backgroundColor: `${INK}30` }} />

        <div className="flex-1 flex flex-col justify-between py-1 gap-4">
          <div className="grid grid-cols-3 gap-5">
            <Field label="Date" value="Sat · 7 Nov 2026" labelSize={12} valueSize={22} />
            <Field label="Event Hours" value="10:00 — 17:00" labelSize={12} valueSize={22} />
            <Field label="Track" value={data.track} labelSize={12} valueSize={22} />
          </div>
          <div className="flex items-end justify-between gap-6">
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#0a0a0a]/60 font-bold">
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
      className="relative w-full h-full font-sans rounded-3xl overflow-hidden"
      style={{ backgroundColor: CREAM }}
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
          borderTop: `2px dashed ${INK}`,
          opacity: 0.4,
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
          titleSize={14}
          subtitleSize={30}
          pcwSize={92}
          endorsementSize={19}
        />

        <div className="border-t border-[#0a0a0a]/15" />

        <div className="flex justify-center">
          <PhotoFrame data={data} style={{ width: 420, height: 420 }} />
        </div>

        <Field
          label="Passenger"
          value={name}
          placeholder="Your name"
          labelSize={14}
          valueSize={60}
        />
        <div className="grid grid-cols-2" style={{ gap: 24 }}>
          <Field label="Team" value={team} labelSize={13} valueSize={26} dim />
          <Field label="Role" value={role} labelSize={13} valueSize={26} dim />
        </div>
        <Field
          label="Destination"
          value="Hack the Feed · Paris"
          labelSize={13}
          valueSize={26}
          dim
        />
        <Field
          label="Building"
          value={building}
          placeholder="One clear sentence about what you're building."
          labelSize={14}
          valueSize={30}
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
        <div className="font-mono text-[13px] tracking-[0.2em] uppercase text-[#0a0a0a]/75 font-bold">
          In partnership with
        </div>
        <PartnerRow size={42} color={INK} gap={46} wrap={false} />
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
        <HTFEventPanel size={180} style={{ height: 240, width: 360 }} />

        <div className="flex flex-col justify-between gap-4 border-l pl-10" style={{ borderColor: `${INK}30` }}>
          <div className="flex flex-col gap-4">
            <Field label="Date" value="Sat · 7 Nov 2026" labelSize={14} valueSize={28} />
            <Field label="Event Hours" value="10:00 — 17:00" labelSize={14} valueSize={28} />
            <Field label="Track" value={data.track} labelSize={14} valueSize={28} />
          </div>
          <div className="flex items-end justify-between gap-4">
            <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-[#0a0a0a]/60 font-bold">
              HTF · 7.11.26
            </div>
            <Barcode
              seed={name + team + data.track}
              height={48}
              count={32}
              thickness={2.4}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export type { Variant };
