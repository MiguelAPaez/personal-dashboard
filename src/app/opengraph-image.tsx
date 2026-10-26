import { ImageResponse } from "next/og";
import { profile } from "@/content";

export const alt = `${profile.name} portfolio`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", height: "100%", padding: 80, background: "#eef0ea", color: "#10161c" }}>
        <div style={{ fontSize: 40, color: "#0a6b47" }}>{profile.name}</div>
        <div style={{ fontSize: 72, marginTop: 24, lineHeight: 1.1 }}>{profile.headline}</div>
      </div>
    ),
    size,
  );
}
