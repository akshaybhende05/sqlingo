import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CareerLadder — free, hands-on IT courses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          background: "#14201d",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 78, fontWeight: 800, letterSpacing: -2 }}>
          <span style={{ color: "#ffffff" }}>Career</span>
          <span style={{ color: "#4cc4b3" }}>Ladder</span>
        </div>
        <div style={{ display: "flex", marginTop: 30, fontSize: 42, color: "#e9efec", fontWeight: 600 }}>
          Learn the skills IT jobs actually need.
        </div>
        <div style={{ display: "flex", marginTop: 22, fontSize: 26, color: "#8aa39c" }}>
          Free · No signup · Hands-on · SQL, Python, Django, FastAPI, DevOps, QA, BA
        </div>
        <div style={{ display: "flex", marginTop: 46, fontSize: 22, color: "#4cc4b3", fontWeight: 700 }}>
          careerladder.io
        </div>
      </div>
    ),
    { ...size }
  );
}
