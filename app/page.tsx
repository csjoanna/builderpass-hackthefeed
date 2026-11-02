"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from "react";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowDown,
  Calendar,
  Check,
  Clock,
  Download,
  MapPin,
  Minus,
  Plus,
  Share2,
  Trophy,
  Upload,
  ArrowLeftRight,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import { Pass, type PassData } from "./components/Pass";
import { ExportStage, FORMATS, type Format } from "./components/ExportStage";
import {
  HackTheFeedTitle,
  PartnerRow,
  ParisCreatorWeekMark,
} from "./components/Brand";

function LinkedinIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.45 20.45h-3.56V14.9c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.64H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

type PreviewKey = "pass" | Format;

const PASS_INTRINSIC = { w: 1200, h: 680 };
const PREVIEW_INFO: Record<
  PreviewKey,
  { short: string; w: number; h: number }
> = {
  pass: { short: "Pass", w: PASS_INTRINSIC.w, h: PASS_INTRINSIC.h },
  x: { short: "X post", w: FORMATS.x.w, h: FORMATS.x.h },
  linkedin: { short: "LinkedIn", w: FORMATS.linkedin.w, h: FORMATS.linkedin.h },
  igpost: { short: "IG post", w: FORMATS.igpost.w, h: FORMATS.igpost.h },
  igstory: { short: "IG story", w: FORMATS.igstory.w, h: FORMATS.igstory.h },
};
const PREVIEW_ORDER: PreviewKey[] = [
  "pass",
  "x",
  "linkedin",
  "igpost",
  "igstory",
];

const STORAGE_KEY = "htf-pass-v1";

const defaultPassData: PassData = {
  name: "",
  role: "",
  team: "",
  building: "",
  track: "Video Search",
  photo: null,
  photoScale: 1.2,
  photoX: 0,
  photoY: 0,
};

export default function Home() {
  const [data, setData] = useState<PassData>(defaultPassData);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount — avoids SSR/CSR mismatch by only
  // reading after the first paint. Photo data URLs can be large (up to ~11 MB
  // for an 8 MB image after base64), so persist them separately and silently
  // drop them if the quota is exceeded.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as Partial<PassData>;
        setData((d) => ({ ...d, ...stored }));
      }
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Likely QuotaExceededError from the photo data URL — retry without it.
      try {
        const { photo: _, ...withoutPhoto } = data;
        void _;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(withoutPhoto));
      } catch {
        // give up silently
      }
    }
  }, [data, hydrated]);

  const [busy, setBusy] = useState<Format | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [activePreview, setActivePreview] = useState<PreviewKey>("pass");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const stageRefs = {
    x: useRef<HTMLDivElement | null>(null),
    linkedin: useRef<HTMLDivElement | null>(null),
    igpost: useRef<HTMLDivElement | null>(null),
    igstory: useRef<HTMLDivElement | null>(null),
  };

  const set = <K extends keyof PassData>(key: K, value: PassData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const loadFile = (file: File) => {
    setPhotoError(null);
    if (!file.type.startsWith("image/")) {
      setPhotoError("That file isn't an image.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setPhotoError("Please upload an image under 8 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === "string" ? reader.result : null;
      setData((d) => ({
        ...d,
        photo: url,
        photoScale: 1.2,
        photoX: 0,
        photoY: 0,
      }));
    };
    reader.readAsDataURL(file);
  };

  const onPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    e.target.value = "";
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  };

  const resetPhotoFraming = () =>
    setData((d) => ({ ...d, photoScale: 1.2, photoX: 0, photoY: 0 }));

  const renderToPng = async (format: Format): Promise<Blob | null> => {
    const node = stageRefs[format].current;
    if (!node) return null;
    const { w, h } = FORMATS[format];
    const dataUrl = await toPng(node, {
      width: w,
      height: h,
      pixelRatio: 1,
      cacheBust: true,
      backgroundColor: "#0a0a0a",
    });
    const res = await fetch(dataUrl);
    return await res.blob();
  };

  const download = async (format: Format) => {
    setBusy(format);
    try {
      const blob = await renderToPng(format);
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${FORMATS[format].filename}.png`;
      a.click();
      URL.revokeObjectURL(url);
      setToast(FORMATS[format].short);
      setTimeout(() => setToast(null), 2400);
    } finally {
      setBusy(null);
    }
  };

  const [bundling, setBundling] = useState(false);
  const [sharing, setSharing] = useState(false);
  const downloadAll = async () => {
    setBundling(true);
    try {
      const zip = new JSZip();
      const formats: Format[] = ["x", "linkedin", "igpost", "igstory"];
      for (const f of formats) {
        const blob = await renderToPng(f);
        if (blob) zip.file(`${FORMATS[f].filename}.png`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "hack-the-feed-builder-pass.zip";
      a.click();
      URL.revokeObjectURL(url);
      setToast("All 4");
      setTimeout(() => setToast(null), 2400);
    } finally {
      setBundling(false);
    }
  };

  // Share active tab: render PNG, then try Web Share API with file + text
  // (opens native share sheet on mobile, lets user pick Instagram/X/etc).
  // On desktop it falls back to downloading the image and opening the
  // platform's share intent URL with the text pre-filled.
  const shareActive = async (format: Format, text: string) => {
    setSharing(true);
    try {
      const blob = await renderToPng(format);
      if (!blob) return;
      const file = new File([blob], `${FORMATS[format].filename}.png`, {
        type: "image/png",
      });

      // Prefer native share sheet (mobile) with image + text in one go.
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({ files: [file], text });
          setToast("Shared");
          setTimeout(() => setToast(null), 2000);
          return;
        } catch (err) {
          // AbortError = user dismissed share sheet; silently drop
          if ((err as Error)?.name === "AbortError") return;
          // other errors fall through to desktop path
        }
      }

      // Desktop fallback: auto-download image + open platform intent URL.
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${FORMATS[format].filename}.png`;
      a.click();
      URL.revokeObjectURL(url);

      const encoded = encodeURIComponent(text);
      const intents: Record<Format, string | null> = {
        x: `https://twitter.com/intent/tweet?text=${encoded}`,
        linkedin: `https://www.linkedin.com/feed/?shareActive=true&text=${encoded}`,
        igpost: null, // Instagram has no web share intent — image is downloaded
        igstory: null,
      };
      const intent = intents[format];
      if (intent) {
        window.open(intent, "_blank", "noopener,noreferrer");
      }
      setToast("Image downloaded");
      setTimeout(() => setToast(null), 2400);
    } finally {
      setSharing(false);
    }
  };

  // Per-platform post text + character limits. Each generator respects the
  // platform's hard limit so the composer never produces copy that would be
  // truncated on paste. Handles are per-platform — see HANDLES below.
  const team = data.team.trim();
  const role = data.role.trim();
  const building = data.building.trim();

  // Partner social handles — mentions must match the actual account on each
  // platform. Update these as the real accounts are confirmed.
  const HANDLES = {
    x: {
      oriane: "@oriane_xyz",
      lovable: "@lovable_dev",
      albertSchool: "@AlbertSchool",
      brut: "@brutofficial",
      pcw: "@ParisCreatorWk",
    },
    linkedin: {
      oriane: "@Oriane",
      lovable: "@Lovable",
      albertSchool: "@Albert School",
      brut: "@Brut.",
      pcw: "@Paris Creator Week",
    },
    instagram: {
      oriane: "@oriane.xyz",
      lovable: "@lovable.dev",
      albertSchool: "@albertschool",
      brut: "@brutofficialfr",
      pcw: "@pariscreatorweek",
    },
  } as const;

  const buildXPost = () => {
    const h = HANDLES.x;
    return `I just got my Hack the Feed builder pass 🎟️

The AI video search hackathon · Sat 7 Nov · Paris
Co-hosted by ${h.oriane} ${h.lovable} ${h.albertSchool} ${h.brut}
Side event of ${h.pcw}

RSVP → luma.com/h7aqkkw4

#HackTheFeed #AIVideo`;
  };

  const buildLinkedInPost = () => {
    const h = HANDLES.linkedin;
    const teamLine = team
      ? `Team ${team}${role ? ` · ${role}` : ""}.`
      : role
      ? `${role}.`
      : null;
    const buildingLine = building
      ? `What I'm building: ${building}`
      : "What I'm building: shipping something new in video — one day, one demo.";
    const lines: (string | null)[] = [
      "I just got my Hack the Feed builder pass.",
      "",
      "📍 Saturday 7 November 2026 · 10am – 5pm · Paris",
      `🎯 The AI video search hackathon · Track: ${data.track}`,
      "",
      buildingLine,
      teamLine,
      "",
      `Co-hosted by ${h.oriane} · ${h.lovable} · ${h.albertSchool} · ${h.brut}.`,
      `Official side event of ${h.pcw}.`,
      "",
      "Prize pool: €1,000 + 3,500 AI credits for the winning builder.",
      "",
      "If you build in video, generative media or search — come say hi.",
      "RSVP → https://luma.com/h7aqkkw4",
      "",
      "#HackTheFeed #ParisCreatorWeek #AIVideo #GenerativeAI #VideoSearch #BuilderCommunity",
    ];
    return lines.filter((l) => l !== null).join("\n");
  };

  const buildIgPostCaption = () => {
    const h = HANDLES.instagram;
    const buildingLine = building
      ? `Building → ${building}`
      : "Building something new in video search.";
    const teamLine = team
      ? `Team ${team}${role ? ` · ${role}` : ""}`
      : null;
    return [
      "I just got my Hack the Feed builder pass 🎟️",
      "",
      "The AI video search hackathon.",
      "📍 Saturday 7 November · Paris",
      `🎯 Track: ${data.track}`,
      "",
      buildingLine,
      teamLine,
      "",
      `Co-hosted by ${h.oriane} · ${h.lovable} · ${h.albertSchool} · ${h.brut}`,
      `Official side event of ${h.pcw}`,
      "",
      "RSVP in bio · luma.com/h7aqkkw4",
      "",
      "#HackTheFeed #ParisCreatorWeek #AIVideo #VideoSearch #ParisTech",
    ]
      .filter((l) => l !== null)
      .join("\n");
  };

  const buildIgStoryText = () => {
    // Story text limit is practical, not hard — stickers/overlays are short.
    const h = HANDLES.instagram;
    return `Hack the Feed 🎟️
Sat 7 Nov · Paris
Side event of ${h.pcw}
RSVP → luma.com/h7aqkkw4`;
  };

  const PLATFORM_TEXT: Record<
    PreviewKey,
    { text: string; max: number; label: string }
  > = {
    pass: {
      text: buildLinkedInPost(),
      max: 3000,
      label: "LinkedIn post",
    },
    x: { text: buildXPost(), max: 280, label: "X post" },
    linkedin: {
      text: buildLinkedInPost(),
      max: 3000,
      label: "LinkedIn post",
    },
    igpost: {
      text: buildIgPostCaption(),
      max: 2200,
      label: "Instagram caption",
    },
    igstory: {
      text: buildIgStoryText(),
      max: 250,
      label: "Instagram story overlay",
    },
  };
  const currentText = PLATFORM_TEXT[activePreview];
  const copyPostText = async () => {
    try {
      await navigator.clipboard.writeText(currentText.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard failures
    }
  };

  const currentFormat = activePreview === "pass" ? null : activePreview;
  const currentInfo = PREVIEW_INFO[activePreview];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Official side-event bar — subtle, informative, not a loud lime strip */}
      <div className="bg-neutral-950 border-b border-[#c6ff3d]/30 text-[#c6ff3d]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-center gap-3 font-mono text-[10px] sm:text-[11px] tracking-[0.3em] uppercase">
          <span className="inline-block w-1 h-1 bg-[#c6ff3d] rounded-full animate-pulse" />
          Official Paris Creator Week side event
          <span className="opacity-50">·</span>
          <a
            href="https://pariscreatorweek.com"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            Learn more →
          </a>
        </div>
      </div>

      {/* Header — brand mark only; CTAs live in the hero to avoid duplication */}
      <header className="border-b border-neutral-800 sticky top-0 z-10 bg-neutral-950/85 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-3 group">
            <span className="inline-block w-2 h-2 bg-[#c6ff3d] rounded-full" />
            <span className="font-mono text-[12px] tracking-[0.3em] uppercase group-hover:text-[#c6ff3d] transition-colors">
              Hack the Feed
            </span>
          </a>
          <a
            href="#builder"
            className="font-mono text-[11px] tracking-[0.3em] uppercase text-neutral-400 hover:text-[#c6ff3d] transition-colors"
          >
            Build my pass →
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="border-b border-neutral-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(#c6ff3d_1px,transparent_1px)] [background-size:22px_22px] pointer-events-none" />
        {/* Subtle lime vignette top-left gives the hero a light source */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#c6ff3d]/[0.06] blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid lg:grid-cols-[1fr_420px] gap-8 lg:gap-10 items-center min-w-0">
          <div className="min-w-0">
            <div>
              <HackTheFeedTitle size={340} />
            </div>
            <p className="mt-4 text-[18px] text-neutral-200 font-bold max-w-md leading-snug">
              The AI video search hackathon.
            </p>
            <p className="mt-3 text-neutral-400 max-w-md leading-relaxed">
              Build your builder pass, then share it across X, LinkedIn and
              Instagram.
            </p>
            <div className="mt-7 flex items-center gap-4 flex-wrap">
              <a
                href="#builder"
                className="group inline-flex items-center gap-2 bg-[#c6ff3d] hover:bg-[#d7ff6a] text-[#0a0a0a] rounded-md px-5 py-3 text-sm font-bold font-mono tracking-widest uppercase transition-all shadow-[0_10px_30px_-10px_rgba(198,255,61,0.4)] hover:shadow-[0_14px_40px_-10px_rgba(198,255,61,0.6)]"
              >
                Build my pass
                <ArrowDown
                  size={16}
                  className="transition-transform group-hover:translate-y-0.5"
                />
              </a>
              <a
                href="https://luma.com/h7aqkkw4"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-mono tracking-widest uppercase text-neutral-400 hover:text-[#c6ff3d] transition-colors"
              >
                Register on Luma →
              </a>
            </div>
          </div>
          <HeroEventSticker />
        </div>
      </section>

      {/* Partner band — cream so brand colors render correctly, framed with
          the official event language ("in partnership with"). */}
      <section className="bg-[#f3efe6] text-[#0a0a0a] border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7 flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-10 flex-wrap">
          <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-[#0a0a0a]/60 shrink-0">
            In partnership with
          </div>
          <PartnerRow size={30} color="#0a0a0a" gap={40} wrap />
        </div>
      </section>

      {/* Main */}
      <main
        id="builder"
        className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 scroll-mt-24 grid lg:grid-cols-[380px_1fr] gap-8 lg:gap-10"
      >
        {/* Form column */}
        <div className="space-y-8">
          <SectionTitle title="Make it yours" hint="Edits apply live →" />

          <FormSection label="You">
            <Field label="Full name" counter={{ value: data.name, max: 40 }}>
              {(id) => (
                <input
                  id={id}
                  value={data.name}
                  onChange={(e) => set("name", e.target.value.slice(0, 40))}
                  placeholder="Jane Doe"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#c6ff3d]"
                />
              )}
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Team" counter={{ value: data.team, max: 24 }}>
                {(id) => (
                  <input
                    id={id}
                    value={data.team}
                    onChange={(e) => set("team", e.target.value.slice(0, 24))}
                    placeholder="FeedHackers"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#c6ff3d]"
                  />
                )}
              </Field>
              <Field label="Role" counter={{ value: data.role, max: 24 }}>
                {(id) => (
                  <input
                    id={id}
                    value={data.role}
                    onChange={(e) => set("role", e.target.value.slice(0, 24))}
                    placeholder="Engineer"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#c6ff3d]"
                  />
                )}
              </Field>
            </div>
          </FormSection>

          <FormSection label="Project">
            <Field label="Track">
              {(id) => (
                <div
                  id={id}
                  role="radiogroup"
                  aria-label="Track"
                  className="grid grid-cols-2 gap-2"
                >
                  {(["Video Search", "Editorial"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      role="radio"
                      aria-checked={data.track === t}
                      onClick={() => set("track", t)}
                      className={`px-3 py-2 text-sm rounded-md border font-mono tracking-wider uppercase ${
                        data.track === t
                          ? "bg-[#c6ff3d] text-black border-[#c6ff3d]"
                          : "bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-600"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </Field>
            <Field
              label="What are you building?"
              counter={{ value: data.building, max: 110 }}
            >
              {(id) => (
                <textarea
                  id={id}
                  value={data.building}
                  onChange={(e) =>
                    set("building", e.target.value.slice(0, 110))
                  }
                  rows={2}
                  placeholder="One clear sentence about what you're building."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#c6ff3d] resize-none"
                />
              )}
            </Field>
          </FormSection>

          <FormSection label="Photo">
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`flex items-center gap-3 cursor-pointer rounded-md px-3 py-3 text-sm border border-dashed transition-colors ${
                dragOver
                  ? "border-[#c6ff3d] bg-[#c6ff3d]/5"
                  : "border-neutral-700 bg-neutral-900 hover:border-[#c6ff3d]"
              }`}
            >
              {data.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.photo}
                  alt=""
                  className="w-10 h-10 object-cover rounded border border-neutral-700"
                />
              ) : (
                <span className="w-10 h-10 rounded border border-neutral-700 bg-neutral-800 flex items-center justify-center text-neutral-500">
                  <Upload size={16} />
                </span>
              )}
              <span className="flex-1 min-w-0">
                <span className="block text-neutral-200">
                  {data.photo
                    ? "Replace your photo"
                    : "Drop a photo or click to upload"}
                </span>
                <span className="block text-[11px] text-neutral-500 mt-0.5">
                  Square portrait works best · JPG or PNG · up to 8 MB
                </span>
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPhoto}
              />
            </label>
            {photoError && (
              <div className="mt-2 text-xs text-red-400">{photoError}</div>
            )}
            {data.photo && (
              <>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <Slider
                    icon={<Plus size={12} />}
                    label="Zoom"
                    value={data.photoScale}
                    min={1}
                    max={3}
                    step={0.05}
                    onChange={(v) => set("photoScale", v)}
                  />
                  <Slider
                    icon={<ArrowLeftRight size={12} />}
                    label="X"
                    value={data.photoX}
                    min={-50}
                    max={50}
                    step={1}
                    onChange={(v) => set("photoX", v)}
                  />
                  <Slider
                    icon={<ArrowUpDown size={12} />}
                    label="Y"
                    value={data.photoY}
                    min={-50}
                    max={50}
                    step={1}
                    onChange={(v) => set("photoY", v)}
                  />
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs">
                  <button
                    type="button"
                    onClick={resetPhotoFraming}
                    className="text-neutral-400 hover:text-[#c6ff3d] flex items-center gap-1"
                  >
                    <RefreshCw size={12} /> Reset framing
                  </button>
                  <button
                    type="button"
                    onClick={() => set("photo", null)}
                    className="text-neutral-500 hover:text-red-400 flex items-center gap-1"
                  >
                    <Minus size={12} /> Remove photo
                  </button>
                </div>
              </>
            )}
          </FormSection>
        </div>

        {/* Preview + download column */}
        <div className="space-y-6 min-w-0">
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <SectionTitle title="Your builder pass" />
            <div className="font-mono text-[11px] text-neutral-500 tracking-[0.25em] uppercase">
              {currentInfo.w}×{currentInfo.h}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-neutral-800 overflow-x-auto">
            {PREVIEW_ORDER.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActivePreview(key)}
                className={`px-3 py-2 font-mono text-[12px] tracking-[0.2em] uppercase whitespace-nowrap border-b-2 -mb-px transition-colors ${
                  activePreview === key
                    ? "text-[#c6ff3d] border-[#c6ff3d]"
                    : "text-neutral-500 border-transparent hover:text-neutral-300"
                }`}
              >
                {PREVIEW_INFO[key].short}
              </button>
            ))}
          </div>

          {/* Preview stage — scales the real export to fit */}
          <ScaledPreview
            key={activePreview}
            w={currentInfo.w}
            h={currentInfo.h}
          >
            {currentFormat === null ? (
              <Pass data={data} width={currentInfo.w} />
            ) : (
              <ExportStage format={currentFormat} data={data} />
            )}
          </ScaledPreview>

          {/* Primary download CTA */}
          <div className="flex items-center gap-3 flex-wrap">
            {currentFormat ? (
              <button
                type="button"
                onClick={() => download(currentFormat)}
                disabled={busy !== null}
                className="group flex-1 min-w-[220px] relative flex items-center justify-between bg-[#c6ff3d] hover:bg-[#d7ff6a] disabled:opacity-70 text-[#0a0a0a] rounded-md px-5 py-3.5 text-sm font-bold transition-all shadow-[0_10px_30px_-10px_rgba(198,255,61,0.5)] hover:shadow-[0_14px_40px_-10px_rgba(198,255,61,0.7)]"
              >
                <span className="font-mono tracking-widest uppercase">
                  {busy === currentFormat
                    ? "Rendering…"
                    : `Download ${PREVIEW_INFO[currentFormat].short} PNG`}
                </span>
                {busy === currentFormat ? (
                  <Spinner />
                ) : (
                  <Download
                    size={16}
                    className="transition-transform group-hover:translate-y-0.5"
                  />
                )}
              </button>
            ) : (
              <div className="flex-1 min-w-[220px] text-sm text-neutral-500 font-mono tracking-wider uppercase px-1 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 bg-[#c6ff3d] rounded-full animate-pulse" />
                Pick a platform tab to download the matching export
              </div>
            )}
            {currentFormat && (
              <button
                type="button"
                onClick={() => shareActive(currentFormat, currentText.text)}
                disabled={sharing || busy !== null}
                className="shrink-0 flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 border border-neutral-700 hover:border-[#c6ff3d] rounded-md px-4 py-3.5 text-sm font-mono tracking-widest uppercase transition-colors text-[#c6ff3d]"
                title="Share image + text via native share sheet (mobile) or platform (desktop)"
              >
                {sharing ? <Spinner /> : <Share2 size={14} />}
                {sharing ? "Preparing…" : "Share"}
              </button>
            )}
            <button
              type="button"
              onClick={downloadAll}
              disabled={bundling || busy !== null}
              className="shrink-0 flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 border border-neutral-700 hover:border-[#c6ff3d] rounded-md px-4 py-3.5 text-sm font-mono tracking-widest uppercase transition-colors"
              title="Render and zip all four exports"
            >
              {bundling ? <Spinner /> : <Download size={14} />}
              {bundling ? "Bundling…" : "All 4 · ZIP"}
            </button>
          </div>

          {/* Platform post composer — swaps per active tab, enforces limit */}
          <div className="border border-neutral-800 rounded-md">
            <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
              <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-neutral-400">
                {currentText.label}
              </div>
              <div className="flex items-center gap-3">
                <span
                  aria-live="polite"
                  className={`font-mono text-[11px] ${
                    currentText.text.length > currentText.max
                      ? "text-red-400"
                      : currentText.text.length > currentText.max * 0.9
                      ? "text-amber-400"
                      : "text-neutral-500"
                  }`}
                >
                  {currentText.text.length}/{currentText.max}
                </span>
                <button
                  type="button"
                  onClick={copyPostText}
                  className="flex items-center gap-2 text-xs text-[#c6ff3d] hover:underline"
                >
                  <LinkedinIcon size={14} />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-neutral-200 p-4 font-sans max-h-[420px] overflow-y-auto">
              {currentText.text}
            </pre>
            {currentText.text.length > currentText.max && (
              <div className="px-4 pb-3 text-[11px] text-red-400 font-mono tracking-wider uppercase">
                ⚠ Over {currentText.max}-char limit — trim before posting
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-800 py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 font-mono tracking-widest uppercase">
          <span>Hack the Feed · Official Paris Creator Week side event</span>
          <span>
            Made with <span aria-label="love">♥</span> by{" "}
            <a
              href="https://www.linkedin.com/in/csjoanna/"
              target="_blank"
              rel="noreferrer"
              className="text-neutral-300 hover:text-[#c6ff3d] transition-colors"
            >
              Joanna
            </a>
          </span>
        </div>
      </footer>

      {/* Off-screen export stages for download rendering */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: -99999,
          top: 0,
          pointerEvents: "none",
        }}
      >
        <ExportStage ref={stageRefs.x} format="x" data={data} />
        <ExportStage ref={stageRefs.linkedin} format="linkedin" data={data} />
        <ExportStage ref={stageRefs.igpost} format="igpost" data={data} />
        <ExportStage ref={stageRefs.igstory} format="igstory" data={data} />
      </div>

      {toast && <DownloadToast label={toast} />}
    </div>
  );
}

function ScaledPreview({
  w,
  h,
  children,
}: {
  w: number;
  h: number;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ availW: 0, availH: 640 });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const style = window.getComputedStyle(el);
      const padX =
        parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const padY =
        parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      setSize({
        availW: Math.max(0, el.clientWidth - padX),
        availH: Math.max(360, Math.min(820, window.innerHeight * 0.85)) - padY,
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // Mouse-reactive 3D tilt — updates CSS custom properties on the tilt node
  // so transforms + glow follow the cursor without React re-renders.
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const node = tiltRef.current;
    if (!node) return;
    const r = node.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rotY = (x - 0.5) * 14; // ±7°
    const rotX = (0.5 - y) * 10; // ±5°
    node.style.setProperty("--rx", `${rotX}deg`);
    node.style.setProperty("--ry", `${rotY}deg`);
    node.style.setProperty("--gx", `${x * 100}%`);
    node.style.setProperty("--gy", `${y * 100}%`);
    node.style.setProperty("--idle", "paused");
  };
  const onMouseLeave = () => {
    const node = tiltRef.current;
    if (!node) return;
    node.style.setProperty("--rx", "0deg");
    node.style.setProperty("--ry", "0deg");
    node.style.setProperty("--gx", "50%");
    node.style.setProperty("--gy", "0%");
    node.style.setProperty("--idle", "running");
  };

  const scale =
    size.availW > 0 ? Math.min(size.availW / w, size.availH / h) : 0;
  const outW = w * scale;
  const outH = h * scale;
  const aspect = w > h ? "Landscape" : w === h ? "Square" : "Portrait";

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative bg-gradient-to-b from-neutral-900/70 to-neutral-900/30 border border-neutral-800 rounded-xl p-6 flex items-center justify-center overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
      style={{ minHeight: 360, perspective: "1600px" }}
    >
      <div className="absolute top-3 left-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-neutral-500 z-10">
        <span className="inline-block w-1.5 h-1.5 bg-[#c6ff3d] rounded-full" />
        {aspect} · {w}×{h}
      </div>
      {scale > 0 && (
        <div
          ref={tiltRef}
          className="tilt-card relative"
          style={{
            width: outW,
            height: outH,
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          {/* Pass artwork */}
          <div className="relative rounded-sm shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)]">
            <div
              style={{
                width: w,
                height: h,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                position: "relative",
              }}
            >
              {children}
            </div>
          </div>
          {/* Specular lime glow that follows the cursor */}
          <div
            className="pointer-events-none absolute inset-0 rounded-sm mix-blend-screen opacity-60"
            style={{
              background:
                "radial-gradient(600px circle at var(--gx, 50%) var(--gy, 0%), rgba(198,255,61,0.25), transparent 55%)",
            }}
          />
        </div>
      )}
    </div>
  );
}

function HeroEventSticker() {
  const QR_URL =
    "https://www.linkedin.com/posts/orianexyz_thinkvideo-media-brands-activity-7521118616730296321-5ktq";
  return (
    <div className="w-full max-w-[420px] lg:justify-self-end mx-auto lg:mx-0">
      <div className="relative bg-[#f3efe6] text-[#0a0a0a] rounded-xl p-6 font-mono shadow-[0_30px_80px_-20px_rgba(198,255,61,0.15)]">
        <div className="absolute -top-2 left-10 w-4 h-4 rounded-full bg-neutral-950" />
        <div className="absolute -top-2 right-10 w-4 h-4 rounded-full bg-neutral-950" />
        <div className="pb-4 border-b border-dashed border-[#0a0a0a]/30">
          <div className="text-[10px] tracking-[0.3em] uppercase text-[#0a0a0a]/60">
            Event
          </div>
          <div className="mt-1 text-[20px] font-bold leading-tight">
            AI Video Search Hackathon
          </div>
        </div>
        <div className="pt-4 grid grid-cols-2 gap-4 text-[12px]">
          <StickerCell
            icon={<Calendar size={14} />}
            label="Date"
            value={<>Sat · 7 Nov<br />2026</>}
          />
          <StickerCell
            icon={<Clock size={14} />}
            label="Time"
            value={<>10:00 — 17:00</>}
          />
          <StickerCell
            icon={<MapPin size={14} />}
            label="City"
            value={<>Paris, FR</>}
          />
          <StickerCell
            icon={<Trophy size={14} />}
            label="Prize pool"
            value={<>€1,000 +<br />3,500 credits</>}
          />
        </div>
        <div className="mt-5 flex items-center gap-3 border-t border-dashed border-[#0a0a0a]/30 pt-4">
          <div className="bg-[#0a0a0a] p-1.5 rounded-sm shrink-0">
            <QRCodeSVG
              value={QR_URL}
              size={56}
              bgColor="#0a0a0a"
              fgColor="#c6ff3d"
              level="L"
              marginSize={0}
            />
          </div>
          <div className="flex-1 min-w-0 text-[10px] tracking-[0.3em] uppercase text-[#0a0a0a]/60 font-bold">
            Scan to read
            <br />
            the announcement
          </div>
        </div>
      </div>
    </div>
  );
}

function StickerCell({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] tracking-[0.3em] uppercase text-[#0a0a0a]/60">
        {icon && <span className="text-[#0a0a0a]/50">{icon}</span>}
        {label}
      </div>
      <div className="mt-0.5 text-[14px] font-bold leading-tight">{value}</div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function DownloadToast({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#c6ff3d] text-[#0a0a0a] rounded-md px-4 py-3 shadow-[0_20px_40px_-10px_rgba(198,255,61,0.4)] font-mono text-[12px] tracking-[0.2em] uppercase font-bold animate-[fadein_200ms_ease-out]"
    >
      <Check size={16} strokeWidth={3} aria-hidden />
      {label} downloaded
    </div>
  );
}

function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-baseline gap-4 flex-wrap">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {hint && (
        <span className="font-mono text-neutral-500 text-[11px] tracking-[0.25em] uppercase">
          {hint}
        </span>
      )}
    </div>
  );
}

function FormSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-neutral-500">
          {label}
        </span>
        <span className="flex-1 h-px bg-neutral-800" />
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  counter,
  children,
}: {
  label: string;
  counter?: { value: string; max: number };
  // Render-prop form passes a stable id for proper label/input association.
  children: ((id: string) => React.ReactNode) | React.ReactNode;
}) {
  const id = useId();
  const counterId = counter ? `${id}-count` : undefined;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor={id}
          className="font-mono text-[11px] tracking-[0.25em] uppercase text-neutral-400"
        >
          {label}
        </label>
        {counter && (
          <span
            id={counterId}
            aria-live="polite"
            className="font-mono text-[11px] text-neutral-500"
          >
            {counter.value.length}/{counter.max}
          </span>
        )}
      </div>
      {typeof children === "function" ? children(id) : children}
    </div>
  );
}

function Slider({
  icon,
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-md px-2 py-2">
      <div className="flex items-center gap-1 text-neutral-400 mb-1 text-[10px] font-mono uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[#c6ff3d]"
      />
    </div>
  );
}
