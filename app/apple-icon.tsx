import { ImageResponse } from "next/og"

// Image metadata
export const size = {
  width: 180,
  height: 180,
}

export const contentType = "image/png"

// Apple Icon generation (180x180 for iOS)
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 100,
        background: "#18181b",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "bold",
        fontFamily: "sans-serif",
      }}
    >
      장부
    </div>,
    {
      ...size,
    }
  )
}
