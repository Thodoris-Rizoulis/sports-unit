import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Sports Unit - Professional Sports Network";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: "linear-gradient(135deg, #1a365d 0%, #2d4a77 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          padding: 60,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 100 100"
            fill="none"
            style={{ marginRight: 24 }}
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="white"
              strokeWidth="4"
              fill="none"
            />
            <path d="M30 50 L50 30 L70 50 L50 70 Z" fill="white" />
          </svg>
          <span style={{ fontSize: 64, fontWeight: 700 }}>Sports Unit</span>
        </div>
        <div
          style={{
            fontSize: 32,
            opacity: 0.9,
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          Professional Sports Network
        </div>
        <div
          style={{
            fontSize: 24,
            opacity: 0.7,
            marginTop: 24,
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          Connect with athletes, coaches, and scouts building the future of
          sports
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
