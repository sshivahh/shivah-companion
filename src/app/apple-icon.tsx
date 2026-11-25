import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// A register line marked with a highlighter.
export default function AppleIcon() {
  const line = { position: "absolute" as const, left: 34, height: 8, borderRadius: 4, background: "rgba(242,244,247,0.35)" };
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#16213e" }}>
        <div style={{ ...line, top: 46, width: 112 }} />
        <div style={{ position: "absolute", left: 34, top: 76, width: 112, height: 30, borderRadius: 8, background: "#ffe04d" }} />
        <div style={{ ...line, top: 128, width: 78 }} />
      </div>
    ),
    size,
  );
}
