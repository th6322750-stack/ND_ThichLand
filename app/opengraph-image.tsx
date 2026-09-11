import { ImageResponse } from "next/og";
import { brandLogoDataUrl } from "@/lib/brandLogoDataUrl";

export const alt = "NDTHICH LAND — Bất động sản cho thuê & dự án";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 82px",
          color: "#111111",
          background: "linear-gradient(135deg, #ffffff 0%, #f7f1ef 58%, #ead4d2 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders with satori, not the DOM; next/image doesn't apply here. */}
          <img
            src={brandLogoDataUrl}
            alt=""
            width={92}
            height={92}
            style={{ borderRadius: "50%", boxShadow: "0 6px 20px rgba(0,0,0,0.18)" }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 24, color: "#5f5d5d", letterSpacing: 2 }}>BẤT ĐỘNG SẢN</span>
            <span style={{ fontSize: 46, fontWeight: 800, color: "#880206" }}>NDTHICH LAND</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 940 }}>
          <span style={{ fontSize: 68, lineHeight: 1.08, fontWeight: 800 }}>Không gian sống &amp;</span>
          <span style={{ fontSize: 68, lineHeight: 1.08, fontWeight: 800, color: "#880206" }}>kinh doanh lý tưởng</span>
          <span style={{ marginTop: 30, fontSize: 26, color: "#5f5d5d" }}>Cho thuê bất động sản · Dự án · Tư vấn</span>
        </div>
      </div>
    ),
    size,
  );
}
