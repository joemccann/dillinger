import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Dillinger - Online Markdown Editor";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#2B2F36",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            color: "#35D7BB",
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "0.05em",
            marginBottom: 24,
          }}
        >
          DILLINGER
        </div>
        <div
          style={{
            color: "#D3DAEA",
            fontSize: 32,
            fontWeight: 400,
            marginBottom: 48,
          }}
        >
          Online Markdown Editor
        </div>
        <div
          style={{
            display: "flex",
            gap: 32,
            color: "#A0AABF",
            fontSize: 20,
          }}
        >
          <span>Live Preview</span>
          <span style={{ color: "#35D7BB" }}>·</span>
          <span>Cloud Sync</span>
          <span style={{ color: "#35D7BB" }}>·</span>
          <span>AI-Ready</span>
          <span style={{ color: "#35D7BB" }}>·</span>
          <span>Free</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
