import { ImageResponse } from "next/og"

// Image metadata
export const size = {
  width: 512,
  height: 512,
}

export const contentType = "image/png"

// Icon generation
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 280,
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
