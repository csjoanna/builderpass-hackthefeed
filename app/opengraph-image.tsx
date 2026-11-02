import { ImageResponse } from "next/og";

export const alt = "Hack the Feed — Builder Pass";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 88px",
          backgroundColor: "#f3efe6",
          color: "#0a0a0a",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 24,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: "#4d7c0f",
              fontWeight: 500,
              fontFamily: "monospace",
            }}
          >
            Builder Boarding Pass
          </div>
          <div
            style={{
              fontSize: 116,
              lineHeight: 1.02,
              fontWeight: 600,
              letterSpacing: -3,
            }}
          >
            Hack the Feed
          </div>
          <div
            style={{
              fontSize: 40,
              opacity: 0.78,
              fontWeight: 400,
              marginTop: 6,
              maxWidth: 980,
              lineHeight: 1.25,
            }}
          >
            The AI video search hackathon. Paris · Saturday 7 November 2026.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              opacity: 0.6,
              fontFamily: "monospace",
            }}
          >
            Oriane · Lovable · Albert School · Brut.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              opacity: 0.6,
              fontFamily: "monospace",
            }}
          >
            Paris Creator Week · Official Side Event
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
