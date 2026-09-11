import { ImageResponse } from "next/og";
import { brandLogoDataUrl } from "@/lib/brandLogoDataUrl";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders with satori, not the DOM; next/image doesn't apply here. */}
        <img src={brandLogoDataUrl} alt="" width={64} height={64} style={{ objectFit: "cover" }} />
      </div>
    ),
    size,
  );
}
