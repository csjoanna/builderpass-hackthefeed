"use client";

import type { CSSProperties, ReactNode } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  AlbertSchoolMark,
  BrutMark,
  HackTheFeedTitle,
  LovableMark,
  OrianeMark,
  PartnerRow,
  ParisCreatorWeekMark,
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

type ScaledProps = {
  data: PassData;
  width: number;
};

export const QR_URL =
  "https://www.linkedin.com/posts/orianexyz_thinkvideo-media-brands-activity-7521118616730296321-5ktq?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAAy-ddsBmfXY7Rehroe8URXxoNmryBRVyag";
export const QR_DISPLAY = "linkedin.com/posts/orianexyz";

// Horizontal: 1200 × 680 — used in app preview + X post + any landscape.
export const H_BASE = { w: 1200, h: 680 };
// Square: 1080 × 1080 — used for LinkedIn + IG post.
export const S_BASE = { w: 1080, h: 1080 };
// Vertical: 1080 × 1920 — used for IG story.
export const V_BASE = { w: 1080, h: 1920 };

// Public: horizontal variant used throughout the app preview and X post.
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
  const outerStyle: CSSProperties = {
    width,
    height: base.h * scale,
  };
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
// Shared field components
// ———————————————————————————————————————————————
function StubField({
  label,
  value,
  placeholder,
  big,
  size,
}: {
  label: string;
  value: string;
  placeholder?: string;
  big?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const isEmpty = !value;
  const displayValue = value || placeholder || "";
  const labelClass =
    size === "lg"
      ? "text-[14px] tracking-[0.3em]"
      : size === "sm"
      ? "text-[10px] tracking-[0.3em]"
      : "text-[11px] tracking-[0.3em]";
  const valueClass = big
    ? size === "lg"
      ? "mt-1 text-[38px] font-bold leading-tight"
      : "mt-1 text-[22px] font-bold leading-tight"
    : size === "lg"
    ? "mt-1 text-[22px] font-medium leading-snug"
    : "mt-1 text-[16px] font-medium leading-snug";
  return (
    <div>
      <div className={`${labelClass} uppercase text-[#0a0a0a]/60`}>
        {label}
      </div>
      <div
        className={`${valueClass} ${
          isEmpty ? "text-[#0a0a0a]/35 italic font-normal" : ""
        }`}
      >
        {displayValue}
      </div>
    </div>
  );
}

function Barcode({
  seed,
  height = 56,
  count = 48,
  width = 2,
}: {
  seed: string;
  height?: number;
  count?: number;
  width?: number;
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
          className="bg-[#0a0a0a]"
          style={{ width: w * width, height: "100%" }}
        />
      ))}
    </div>
  );
}

function PhotoFrame({
  data,
  className,
}: {
  data: PassData;
  className?: string;
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
      className={`relative bg-[#0a0a0a] overflow-hidden rounded-sm ${className ?? ""}`}
    >
      <div className="absolute inset-0 bg-neutral-800" style={photoStyle} />
      <div className="absolute left-3 bottom-3 bg-[#c6ff3d] text-[#0a0a0a] px-2 py-1 text-[10px] font-bold tracking-[0.2em] uppercase">
        Builder · Paris
      </div>
    </div>
  );
}

// ———————————————————————————————————————————————
// Variant 1 — HORIZONTAL (1200×680)
// ———————————————————————————————————————————————
function HorizontalPassContent({ data }: { data: PassData }) {
  const teamRole = [data.team, data.role].filter(Boolean).join(" · ");
  return (
    <div className="relative w-full h-full bg-[#f3efe6] text-[#0a0a0a] font-mono">
      {/* Notches + seam */}
      <div className="absolute left-[320px] -top-5 w-10 h-10 rounded-full bg-neutral-950" />
      <div className="absolute left-[320px] -bottom-5 w-10 h-10 rounded-full bg-neutral-950" />
      <div className="absolute left-[340px] top-6 bottom-6 w-px border-l-2 border-dashed border-[#0a0a0a]/40" />

      {/* Left stub */}
      <div className="absolute left-10 top-10 w-[260px] bottom-10 flex flex-col">
        <PhotoFrame data={data} className="w-[260px] h-[260px]" />
        <div className="mt-5">
          <StubField label="Builder" value={data.name} placeholder="Your name" big />
        </div>
        <div className="mt-4">
          <StubField label="Team · Role" value={teamRole} placeholder="Team · Role" />
        </div>
        <div className="mt-auto">
          <Barcode seed={data.name + data.team} height={38} count={36} width={1.6} />
          <div className="mt-2 text-[9px] tracking-[0.3em] uppercase text-[#0a0a0a]/60">
            Hack the Feed · 2026
          </div>
        </div>
      </div>

      {/* Right main */}
      <div className="absolute left-[380px] top-10 right-10 bottom-10 flex flex-col">
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-dashed border-[#0a0a0a]/30">
          <div className="text-[11px] tracking-[0.35em] uppercase text-[#0a0a0a]/60">
            AI Video Hackathon
          </div>
          <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-[#0a0a0a]/60">
            Part of
            <ParisCreatorWeekMark height={24} color="#0a0a0a" />
          </div>
        </div>
        <div className="mt-4 flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <HackTheFeedTitle size={240} />
          </div>
          <div className="shrink-0 border border-[#0a0a0a] bg-[#c6ff3d] rounded-sm px-3 py-2 text-right min-w-[160px]">
            <div className="text-[10px] tracking-[0.3em] uppercase text-[#0a0a0a]/70">
              Track
            </div>
            <div className="mt-0.5 text-[16px] font-bold tracking-wider uppercase">
              {data.track}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <StubField
            label="What I'm building"
            value={data.building}
            placeholder="One clear sentence about what you're building."
          />
        </div>

        <div className="mt-5 flex items-stretch gap-4 border-y border-dashed border-[#0a0a0a]/40 py-3">
          <div className="bg-[#0a0a0a] p-1.5 rounded-sm">
            <QRCodeSVG
              value={QR_URL}
              size={78}
              bgColor="#0a0a0a"
              fgColor="#c6ff3d"
              level="L"
              marginSize={0}
            />
          </div>
          <div className="flex-1 flex flex-col justify-center min-w-0">
            <div className="text-[10px] tracking-[0.3em] uppercase text-[#0a0a0a]/60">
              Scan the post
            </div>
            <div className="mt-0.5 text-[15px] font-bold leading-tight truncate">
              {QR_DISPLAY}
            </div>
            <div className="mt-1 text-[11px] text-[#0a0a0a]/70 leading-snug">
              Doors 09:00 · Build 10:00 · Demos 18:00
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <div className="grid grid-cols-3 gap-x-6">
            <StubField label="Date" value="Sat · 7 Nov 2026" />
            <StubField label="City" value="Paris · FR" />
            <StubField label="Prize Pool" value="€1,000 + 3,500 credits" />
          </div>
          <div className="mt-4">
            <div className="text-[10px] tracking-[0.3em] uppercase text-[#0a0a0a]/60 mb-2">
              Hosted by
            </div>
            <PartnerRow size={22} color="#0a0a0a" gap={28} wrap={false} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ———————————————————————————————————————————————
// Variant 2 — SQUARE (1080×1080)
// Used for LinkedIn + IG post. Two-column layout: left stub with photo
// and builder identity, right main with title, building, QR, partners.
// ———————————————————————————————————————————————
function SquarePassContent({ data }: { data: PassData }) {
  const teamRole = [data.team, data.role].filter(Boolean).join(" · ");
  return (
    <div className="relative w-full h-full bg-[#f3efe6] text-[#0a0a0a] font-mono">
      {/* Notches + seam */}
      <div className="absolute left-[460px] -top-5 w-10 h-10 rounded-full bg-neutral-950" />
      <div className="absolute left-[460px] -bottom-5 w-10 h-10 rounded-full bg-neutral-950" />
      <div className="absolute left-[480px] top-10 bottom-10 w-px border-l-2 border-dashed border-[#0a0a0a]/40" />

      {/* Left stub — photo + identity */}
      <div className="absolute left-16 top-16 w-[400px] bottom-16 flex flex-col">
        <PhotoFrame data={data} className="w-[400px] h-[400px]" />
        <div className="mt-6">
          <StubField
            label="Builder"
            value={data.name}
            placeholder="Your name"
            big
            size="lg"
          />
        </div>
        <div className="mt-5">
          <StubField
            label="Team · Role"
            value={teamRole}
            placeholder="Team · Role"
            size="lg"
          />
        </div>
        <div className="mt-auto">
          <Barcode seed={data.name + data.team} height={54} count={40} width={2.2} />
          <div className="mt-2 text-[11px] tracking-[0.3em] uppercase text-[#0a0a0a]/60">
            Hack the Feed · 2026 · OR / HTF / PAR
          </div>
        </div>
      </div>

      {/* Right main */}
      <div className="absolute left-[520px] top-16 right-16 bottom-16 flex flex-col">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-dashed border-[#0a0a0a]/30">
          <div className="text-[13px] tracking-[0.35em] uppercase text-[#0a0a0a]/60">
            AI Video Hackathon
          </div>
          <div className="flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase text-[#0a0a0a]/60">
            Part of
            <ParisCreatorWeekMark height={28} color="#0a0a0a" />
          </div>
        </div>
        <div className="mt-5 flex items-start justify-between gap-5">
          <div className="flex-1 min-w-0">
            <HackTheFeedTitle size={300} />
          </div>
          <div className="shrink-0 border border-[#0a0a0a] bg-[#c6ff3d] rounded-sm px-4 py-2.5 text-right min-w-[180px]">
            <div className="text-[11px] tracking-[0.3em] uppercase text-[#0a0a0a]/70">
              Track
            </div>
            <div className="mt-0.5 text-[18px] font-bold tracking-wider uppercase">
              {data.track}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <StubField
            label="What I'm building"
            value={data.building}
            placeholder="One clear sentence about what you're building."
            size="lg"
          />
        </div>

        <div className="mt-6 flex items-stretch gap-5 border-y border-dashed border-[#0a0a0a]/40 py-5">
          <div className="bg-[#0a0a0a] p-2 rounded-sm">
            <QRCodeSVG
              value={QR_URL}
              size={120}
              bgColor="#0a0a0a"
              fgColor="#c6ff3d"
              level="L"
              marginSize={0}
            />
          </div>
          <div className="flex-1 flex flex-col justify-center min-w-0">
            <div className="text-[12px] tracking-[0.3em] uppercase text-[#0a0a0a]/60">
              Scan the post
            </div>
            <div className="mt-1 text-[20px] font-bold leading-tight truncate">
              {QR_DISPLAY}
            </div>
            <div className="mt-1.5 text-[14px] text-[#0a0a0a]/70 leading-snug">
              Doors 09:00 · Build 10:00 · Demos 18:00
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <div className="grid grid-cols-3 gap-x-4">
            <StubField label="Date" value="Sat · 7 Nov 2026" size="sm" />
            <StubField label="City" value="Paris · FR" size="sm" />
            <StubField label="Prize" value="€1,000 + credits" size="sm" />
          </div>
          <div className="mt-5">
            <div className="text-[11px] tracking-[0.3em] uppercase text-[#0a0a0a]/60 mb-3">
              Hosted by
            </div>
            <PartnerRow size={24} color="#0a0a0a" gap={28} wrap={false} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ———————————————————————————————————————————————
// Variant 3 — VERTICAL (1080×1920)
// Full vertical boarding pass, used for IG story.
// ———————————————————————————————————————————————
function VerticalPassContent({ data }: { data: PassData }) {
  const teamRole = [data.team, data.role].filter(Boolean).join(" · ");
  return (
    <div className="relative w-full h-full bg-[#f3efe6] text-[#0a0a0a] font-mono flex flex-col">
      {/* HEADER STRIP — Oriane (host) left · PCW boxed badge right */}
      <div className="px-14 pt-10 pb-6 flex items-start justify-between gap-6">
        <OrianeMark height={44} color="#0a0a0a" />
        <div className="flex flex-col items-end gap-1">
          <ParisCreatorWeekMark height={90} color="#0a0a0a" />
          <div className="text-[11px] tracking-[0.3em] uppercase font-bold text-[#0a0a0a]/70">
            Official side event
          </div>
        </div>
      </div>

      {/* HERO BLOCK — centered title + tagline + date, like the banner */}
      <div className="px-10 pt-0 pb-4 text-center flex flex-col items-center">
        <HackTheFeedTitle size={520} />
        <div className="mt-3 text-[32px] font-bold leading-tight max-w-[800px]">
          The AI video search hackathon.
        </div>
        <div className="mt-3 text-[20px] tracking-wider uppercase text-[#0a0a0a]/70 font-bold">
          Saturday 7 November · 10am — 5pm · Paris
        </div>
      </div>

      {/* PHOTO with TRACK chip overlaid */}
      <div className="mx-14 relative">
        <PhotoFrame data={data} className="h-[460px]" />
        <div className="absolute top-4 right-4 bg-[#c6ff3d] text-[#0a0a0a] px-4 py-2 text-[14px] font-bold tracking-widest uppercase shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
          Track · {data.track}
        </div>
      </div>

      {/* IDENTITY — Builder + Team · Role */}
      <div className="px-14 pt-5 grid grid-cols-2 gap-8">
        <StubField label="Builder" value={data.name} placeholder="Your name" big size="lg" />
        <StubField label="Team · Role" value={teamRole} placeholder="Team · Role" big size="lg" />
      </div>

      {/* BUILDING */}
      <div className="px-14 pt-4">
        <StubField
          label="What I'm building"
          value={data.building}
          placeholder="One clear sentence about what you're building."
          size="lg"
        />
      </div>

      {/* PARTNERS — "In partnership with" (mirrors the banner) */}
      <div className="mt-auto px-14 pt-5 pb-5 border-t border-dashed border-[#0a0a0a]/30">
        <div className="text-center text-[16px] tracking-[0.35em] uppercase text-[#0a0a0a]/60 mb-4">
          In partnership with
        </div>
        <div className="flex items-center justify-center">
          <PartnerRowPartnership size={52} color="#0a0a0a" gap={56} />
        </div>
      </div>

      {/* Barcode + prize line */}
      <div className="px-14 pb-8">
        <div className="flex items-end justify-between gap-6">
          <Barcode seed={data.name + data.team} height={54} count={44} width={2.2} />
          <div className="text-right text-[14px] tracking-[0.3em] uppercase text-[#0a0a0a]/60 font-bold">
            Prize pool
            <br />
            €1,000 + 3,500 credits
          </div>
        </div>
      </div>
    </div>
  );
}

// Partner row for the "in partnership with" tier — Lovable, Brut, Albert School
// (Oriane renders separately as the host.)
function PartnerRowPartnership({
  size,
  color,
  gap,
}: {
  size: number;
  color: string;
  gap: number;
}) {
  return (
    <div
      className="inline-flex items-center flex-nowrap"
      style={{ color, columnGap: gap }}
    >
      <LovableMark height={size * 1.05} />
      <BrutMark height={size * 1.05} color={color} />
      <AlbertSchoolMark height={size} color={color} />
    </div>
  );
}

// Keep an export of the Variant type for callers that want to pick.
export type { Variant };
