"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useFocusTrap } from "@/lib/useFocusTrap";

interface GalleryProps {
  images: string[];
  layout?: "mosaic" | "grid";
}

export function Gallery({ images, layout = "mosaic" }: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const open = activeIndex !== null;
  const close = () => setActiveIndex(null);
  const dialogRef = useFocusTrap(open, close);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") {
        setActiveIndex((i) => (i === null ? i : (i + 1) % images.length));
      } else if (e.key === "ArrowLeft") {
        setActiveIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, images.length]);

  if (images.length === 0) {
    return <div className="aspect-[16/9] rounded-md bg-soft" role="img" aria-label="Không có ảnh" />;
  }

  return (
    <div>
      {layout === "mosaic" ? (
        <div className="hidden desktop:grid desktop:grid-cols-4 desktop:gap-2">
          <button
            type="button"
            aria-label={`Xem ảnh 1 / ${images.length}`}
            className="relative col-span-2 row-span-2 aspect-[4/3] overflow-hidden rounded-md"
            onClick={() => setActiveIndex(0)}
          >
            <Image src={images[0]} alt="" fill className="object-cover" unoptimized />
          </button>
          {images.slice(1, 5).map((src, i) => (
            <button
              key={src + i}
              type="button"
              aria-label={`Xem ảnh ${i + 2} / ${images.length}`}
              className="relative aspect-[4/3] overflow-hidden rounded-md"
              onClick={() => setActiveIndex(i + 1)}
            >
              <Image src={src} alt="" fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      ) : (
        <div className="hidden desktop:grid desktop:grid-cols-2 desktop:gap-4">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              aria-label={`Xem ảnh ${i + 1} / ${images.length}`}
              className="relative aspect-[16/10] overflow-hidden rounded-md"
              onClick={() => setActiveIndex(i)}
            >
              <Image src={src} alt="" fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      )}

      {/* Mobile swipe strip */}
      <div className="flex gap-2 overflow-x-auto desktop:hidden" role="list">
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            aria-label={`Xem ảnh ${i + 1} / ${images.length}`}
            className="relative aspect-[4/3] w-[80vw] flex-shrink-0 overflow-hidden rounded-md"
            onClick={() => setActiveIndex(i)}
          >
            <Image src={src} alt="" fill className="object-cover" unoptimized />
          </button>
        ))}
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
              <Image
                src={images[activeIndex!]}
                alt={`${activeIndex! + 1} / ${images.length}`}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="flex items-center gap-6 text-surface">
              <button
                type="button"
                aria-label="Ảnh trước"
                className="flex h-11 w-11 items-center justify-center text-2xl"
                onClick={() => setActiveIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length))}
              >
                ‹
              </button>
              <span>{`${activeIndex! + 1} / ${images.length}`}</span>
              <button
                type="button"
                aria-label="Ảnh sau"
                className="flex h-11 w-11 items-center justify-center text-2xl"
                onClick={() => setActiveIndex((i) => (i === null ? i : (i + 1) % images.length))}
              >
                ›
              </button>
            </div>
            <button
              type="button"
              aria-label="Đóng"
              className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center text-surface"
              onClick={close}
            >
              ✕
            </button>
          </div>
        </>
      )}
    </div>
  );
}
