"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useFocusTrap } from "@/lib/useFocusTrap";

interface Gallery2Props {
  images: string[];
  // 03_ChiTietBDS_MOBILE.png puts the main photo and a stacked thumbnail
  // column SIDE BY SIDE even on mobile — the opposite of the WEB master
  // (both 03 and 05), which always stacks a thumbnail ROW below the main
  // photo. Only the property-detail page needs the mobile side-by-side
  // treatment (05_ChiTietDuAn_MOBILE.png explicitly wants the plain
  // top/below strip instead), so this renders both arrangements and picks
  // one per breakpoint via CSS rather than fighting one grid to do both.
  sideBySideOnMobile?: boolean;
}

export function Gallery2({ images, sideBySideOnMobile = false }: Gallery2Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const open = activeIndex !== null;
  const close = () => setActiveIndex(null);
  const dialogRef = useFocusTrap(open, close);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") setActiveIndex((i) => (i === null ? i : (i + 1) % images.length));
      else if (e.key === "ArrowLeft") setActiveIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, images.length]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (images.length === 0) {
    return <div className="aspect-[4/3] rounded-lg bg-[#F7F6F6]" role="img" aria-label="Không có ảnh" />;
  }

  const thumbs = images.slice(1, 4);
  const extraCount = images.length - 4;

  function renderThumb(src: string, i: number, stackedSquare: boolean) {
    const isLast = i === thumbs.length - 1 && extraCount > 0;
    return (
      <button
        key={src + i}
        type="button"
        aria-label={isLast ? `Xem thêm ${extraCount} ảnh` : `Xem ảnh ${i + 2} / ${images.length}`}
        className={`relative overflow-hidden rounded-lg ${stackedSquare ? "" : "aspect-square"}`}
        onClick={() => setActiveIndex(i + 1)}
      >
        <Image src={src} alt="" fill className="object-cover" unoptimized />
        {isLast && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-[13px] font-bold text-white">
            +{extraCount} ảnh
          </span>
        )}
      </button>
    );
  }

  return (
    <div>
      {sideBySideOnMobile && (
        <div className="grid grid-cols-[65%_1fr] gap-2 min-[900px]:hidden">
          <button
            type="button"
            aria-label={`Xem ảnh 1 / ${images.length}`}
            className="relative aspect-[3/2] overflow-hidden rounded-lg"
            onClick={() => setActiveIndex(0)}
          >
            <Image src={images[0]} alt="" fill className="object-cover" unoptimized priority />
          </button>
          <div className="grid grid-rows-3 gap-1">{thumbs.map((src, i) => renderThumb(src, i, true))}</div>
        </div>
      )}

      <div className={sideBySideOnMobile ? "hidden min-[900px]:block" : ""}>
        <button
          type="button"
          aria-label={`Xem ảnh 1 / ${images.length}`}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-lg"
          onClick={() => setActiveIndex(0)}
        >
          <Image src={images[0]} alt="" fill className="object-cover" unoptimized priority />
        </button>
        <div className="mt-2 grid grid-cols-4 gap-2">{thumbs.map((src, i) => renderThumb(src, i, false))}</div>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-lightbox-backdrop bg-black/90" aria-hidden="true" onClick={close} />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Xem ảnh phóng to"
            className="fixed inset-0 z-lightbox-content flex flex-col items-center justify-center gap-4 p-6"
          >
            <div className="relative h-[70vh] w-full max-w-4xl">
              <Image src={images[activeIndex!]} alt={`${activeIndex! + 1} / ${images.length}`} fill className="object-contain" unoptimized />
            </div>
            <div className="flex items-center gap-6 text-white">
              <button
                type="button"
                aria-label="Ảnh trước"
                className="flex h-[44px] w-[44px] items-center justify-center text-2xl"
                onClick={() => setActiveIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length))}
              >
                ‹
              </button>
              <span>{`${activeIndex! + 1} / ${images.length}`}</span>
              <button
                type="button"
                aria-label="Ảnh sau"
                className="flex h-[44px] w-[44px] items-center justify-center text-2xl"
                onClick={() => setActiveIndex((i) => (i === null ? i : (i + 1) % images.length))}
              >
                ›
              </button>
            </div>
            <button type="button" aria-label="Đóng" className="absolute right-6 top-6 flex h-[44px] w-[44px] items-center justify-center text-white" onClick={close}>
              ✕
            </button>
          </div>
        </>
      )}
    </div>
  );
}
