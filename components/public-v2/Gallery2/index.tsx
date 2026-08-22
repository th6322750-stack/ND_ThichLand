"use client";

import { useEffect, useRef, useState } from "react";
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
  /** WEB main-photo aspect ratio — /du-an/[slug] (05_ChiTietDuAn_WEB.png)
      measures nearly square (~15/16); /cho-thue/[slug] (03_ChiTietBDS_WEB.png)
      keeps the original 4/3. */
  desktopAspect?: string;
}

export function Gallery2({ images, sideBySideOnMobile = false, desktopAspect = "4/3" }: Gallery2Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const open = activeIndex !== null;
  const close = () => setActiveIndex(null);
  const dialogRef = useFocusTrap(open, close);

  const [dragOffset, setDragOffset] = useState(0);
  // `dragging` duplicates "is dragStartRef set" as state on purpose: the
  // transition style is decided during render, and a ref must not be read
  // there (react-hooks/refs).
  const [dragging, setDragging] = useState(false);
  const dragStartRef = useRef<number | null>(null);
  const activeThumbRef = useRef<HTMLButtonElement | null>(null);

  // Keeps the current thumbnail on screen when you page past the end of the
  // visible strip — otherwise the highlight scrolls out of view and the strip
  // stops telling you anything.
  useEffect(() => {
    activeThumbRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [activeIndex]);

  function step(direction: 1 | -1) {
    setActiveIndex((i) => (i === null ? i : (i + direction + images.length) % images.length));
  }

  /** A drag past this many pixels counts as "next/previous", not a wobble. */
  const SWIPE_THRESHOLD = 60;

  function endDrag() {
    if (dragStartRef.current === null) return;
    const offset = dragOffset;
    dragStartRef.current = null;
    setDragging(false);
    setDragOffset(0);
    if (Math.abs(offset) < SWIPE_THRESHOLD) return;
    // Dragging left (negative) reveals the photo to the right.
    step(offset < 0 ? 1 : -1);
  }

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
            className="relative aspect-[21/20] overflow-hidden rounded-lg"
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
          className="relative w-full overflow-hidden rounded-lg"
          style={{ aspectRatio: desktopAspect }}
          onClick={() => setActiveIndex(0)}
        >
          <Image src={images[0]} alt="" fill className="object-cover" unoptimized priority />
        </button>
        <div className="mt-2 grid grid-cols-4 gap-2">{thumbs.map((src, i) => renderThumb(src, i, false))}</div>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-lightbox-backdrop bg-black" aria-hidden="true" onClick={close} />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Xem ảnh phóng to"
            className="fixed inset-0 z-lightbox-content flex flex-col"
          >
            {/* Counter left, close right — a viewer's chrome sits at the edges
                so the photo gets the middle. This used to put the counter and
                both arrows in one cluster under the image, which cost a strip
                of height and put "next" nowhere near the side you swipe. */}
            <div className="flex shrink-0 items-center justify-between px-4 py-3 min-[900px]:px-6">
              <span className="text-[13px] font-medium tabular-nums text-white/80">
                {activeIndex! + 1} / {images.length}
              </span>
              <button
                type="button"
                aria-label="Đóng"
                onClick={close}
                className="flex h-[44px] w-[44px] items-center justify-center rounded-full text-[22px] leading-none text-white/80 transition-colors duration-fast ease-base hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div
              className="relative min-h-0 flex-1 touch-none select-none"
              onPointerDown={(e) => {
                dragStartRef.current = e.clientX;
                setDragging(true);
                setDragOffset(0);
              }}
              onPointerMove={(e) => {
                if (dragStartRef.current === null) return;
                setDragOffset(e.clientX - dragStartRef.current);
              }}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onPointerLeave={endDrag}
            >
              <div
                className="relative h-full w-full"
                style={{
                  transform: `translateX(${dragOffset}px)`,
                  // Snapping back is animated; following the finger is not.
                  transition: dragging ? "none" : "transform 220ms cubic-bezier(.2,.7,.2,1)",
                }}
              >
                <Image
                  src={images[activeIndex!]}
                  alt={`${activeIndex! + 1} / ${images.length}`}
                  fill
                  className="object-contain"
                  draggable={false}
                  unoptimized
                />
              </div>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Ảnh trước"
                    onClick={() => step(-1)}
                    className="absolute left-2 top-1/2 flex h-[44px] w-[44px] -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/40 text-[22px] leading-none text-white transition-colors duration-fast ease-base hover:bg-black/70 min-[900px]:left-6"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    aria-label="Ảnh sau"
                    onClick={() => step(1)}
                    className="absolute right-2 top-1/2 flex h-[44px] w-[44px] -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/40 text-[22px] leading-none text-white transition-colors duration-fast ease-base hover:bg-black/70 min-[900px]:right-6"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* Every photo reachable in one tap, and a permanent read on where
                you are in the set — the old viewer showed neither. */}
            {images.length > 1 && (
              <div className="shrink-0 overflow-x-auto px-4 py-4 min-[900px]:px-6">
                <div className="mx-auto flex w-fit gap-2">
                  {images.map((src, i) => (
                    <button
                      key={src + i}
                      type="button"
                      ref={i === activeIndex ? activeThumbRef : undefined}
                      aria-label={`Xem ảnh ${i + 1} / ${images.length}`}
                      aria-current={i === activeIndex ? "true" : undefined}
                      onClick={() => setActiveIndex(i)}
                      className={`relative h-[48px] w-[64px] shrink-0 overflow-hidden rounded-sm transition-opacity duration-fast ease-base min-[900px]:h-[56px] min-[900px]:w-[76px] ${
                        i === activeIndex
                          ? "opacity-100 ring-2 ring-white"
                          : "opacity-50 hover:opacity-90"
                      }`}
                    >
                      <Image src={src} alt="" fill className="object-cover" unoptimized />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
