"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { PageFlip } from "page-flip";
import { Icon2 as Icon } from "@/components/public-v2/Icon2";

/**
 * "Hồ sơ năng lực" reader — a real book you page through in place.
 *
 * The turn is StPageFlip (`page-flip`), not a hand-rolled transform. An
 * earlier version rotated the whole leaf around the spine with `rotateY`,
 * which reads as a flat panel swinging sideways: paper does not stay flat
 * while it turns, it lifts from the outer corner and curves as it goes.
 * Reproducing that means per-frame fold geometry and two moving shadow
 * gradients — which is exactly what this library already does.
 *
 * Pages come from the PDF, rasterised in the browser with pdf.js. Both
 * libraries are dynamic imports, so a visitor who never scrolls this far
 * downloads neither.
 */
export function ProfileFlipbook2({
  pdfUrl,
  title,
  description,
  downloadLabel = "Tải hồ sơ năng lực",
}: {
  pdfUrl: string;
  title: string;
  description: string;
  downloadLabel?: string;
}) {
  const bookRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlip | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape");
  // The single page's own width in px, read during render to compute the
  // centering shift below — state, not a ref, since React Compiler's purity
  // check rejects reading ref.current while rendering.
  const [pageWidth, setPageWidth] = useState(0);

  /** Rasterises every page once — the library needs the whole set up front. */
  const renderAllPages = useCallback(async (doc: PDFDocumentProxy) => {
    const urls: string[] = [];
    for (let n = 1; n <= doc.numPages; n++) {
      const pdfPage = await doc.getPage(n);
      const viewport = pdfPage.getViewport({ scale: 1.3 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      await pdfPage.render({ canvas, canvasContext: ctx, viewport }).promise;
      urls.push(canvas.toDataURL("image/jpeg", 0.82));
      setProgress({ done: n, total: doc.numPages });
    }
    return urls;
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
        const doc = await pdfjs.getDocument({ url: pdfUrl }).promise;
        if (cancelled) return;

        const first = await doc.getPage(1);
        const { width, height } = first.getViewport({ scale: 1 });
        // Fixed display size derived from the PDF's own page ratio (A4 here,
        // 0.707). `size: "stretch"` was letting the library fit the book to
        // whatever box it was handed, which squashed the pages when that box
        // did not share their proportions. A fixed pair cannot distort.
        const pageHeight = 440;
        const computedPageWidth = Math.round(pageHeight * (width / height));
        setPageWidth(computedPageWidth);
        const urls = await renderAllPages(doc);
        if (cancelled || !bookRef.current) return;

        const { PageFlip: Flip } = await import("page-flip");
        if (cancelled || !bookRef.current) return;

        const book = new Flip(bookRef.current, {
          width: computedPageWidth,
          height: pageHeight,
          size: "fixed",
          // The profile opens on a cover standing alone, exactly like the PDF.
          showCover: true,
          // Below the spread's minimum it falls back to one page at a time
          // rather than squeezing two into illegibility on a phone.
          usePortrait: true,
          maxShadowOpacity: 0.5,
          mobileScrollSupport: true,
          swipeDistance: 30,
          // Default is 1000ms and read as a snap on a page this size — the
          // turn is the point of the component, so it is given time to be seen.
          flippingTime: 1600,
        });
        book.loadFromImages(urls);
        book.on("flip", (e) => setPage(e.data));
        // In two-page (landscape) mode, StPageFlip renders a lone cover on the
        // right half of the spread's full width and a lone trailing page (a
        // back cover, when the page count makes one) on the left half — the
        // other half is intentionally blank, which is the library's book
        // metaphor, not a bug. It reads as "lệch" here because nothing shows
        // the visible half is deliberate. `init`/`changeOrientation` are how
        // the library documents finding out which mode is active — narrow
        // (mobile) viewports fall back to single-page portrait mode instead,
        // where every page already fills the full width and no shift applies.
        book.on("init", (e) => setOrientation(e.data.mode));
        book.on("changeOrientation", (e) => setOrientation(e.data));
        flipRef.current = book;
        setPageCount(doc.numPages);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      flipRef.current?.destroy();
      flipRef.current = null;
    };
  }, [pdfUrl, renderAllPages]);

  return (
    <>
      <div className="mx-auto max-w-[760px] text-center">
        <h2 className="text-[14px] font-bold text-[#0C0D0D] min-[900px]:text-[18px] wide:text-v2-h2">{title}</h2>
        <p className="mx-auto mt-2 max-w-[62ch] text-[12px] leading-relaxed text-[#3A3838] min-[900px]:text-[13px] wide:text-v2-body">
          {description}
        </p>
      </div>

      {/* StPageFlip's "stretch" sizing fills whatever box it is handed, so the
          book needs an explicit one — without it the spread overran the
          container and sat off-centre. px-12 keeps the arrows clear of it. */}
      <div className="relative mx-auto mt-5 w-full max-w-[340px] px-12 min-[900px]:mt-8 min-[900px]:max-w-[780px]">
        {status === "error" && (
          <p className="py-10 text-center text-[12px] text-[#5F5D5D]">
            Không mở được hồ sơ. Bạn có thể tải file về để xem.
          </p>
        )}

        {status === "loading" && (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 min-[900px]:min-h-[460px]">
            <p className="text-[12px] text-[#8A8785]">
              Đang chuẩn bị hồ sơ
              {progress.total > 0 ? ` — ${progress.done}/${progress.total} trang` : "…"}
            </p>
            <div className="h-1 w-[180px] overflow-hidden rounded-full bg-[#EDEBEA]">
              <div
                className="h-full bg-[#880206] transition-[width] duration-base ease-base"
                style={{ width: progress.total ? `${(progress.done / progress.total) * 100}%` : "8%" }}
              />
            </div>
          </div>
        )}

        {/* StPageFlip writes its own DOM in here, so the element stays mounted
            from the start and is merely collapsed while the pages rasterise. */}
        <div className={status === "ready" ? "" : "h-0 overflow-hidden"}>
          <div
            ref={bookRef}
            className="mx-auto transition-transform duration-slow ease-base"
            // Nudges the lone cover/back-cover half toward the centre of the
            // space its blank other half leaves empty — see the "init" /
            // "changeOrientation" comment above for why this only applies in
            // landscape mode. pageCount > 1 guards a would-be single-page
            // profile, where the cover and "last page" are the same page and
            // shifting either direction would be arbitrary.
            style={
              orientation === "landscape" && pageCount > 1 && page === 0
                ? { transform: `translateX(-${pageWidth / 2}px)` }
                : orientation === "landscape" && pageCount > 1 && page === pageCount - 1
                  ? { transform: `translateX(${pageWidth / 2}px)` }
                  : undefined
            }
          />
        </div>

        {status === "ready" && pageCount > 1 && (
          <>
            <button
              type="button"
              aria-label="Trang trước"
              onClick={() => flipRef.current?.flipPrev()}
              className="absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E4E1E0] bg-white text-[20px] leading-none text-[#5F5D5D] shadow-sm transition-colors duration-fast ease-base hover:border-[#880206] hover:text-[#880206] min-[900px]:h-12 min-[900px]:w-12"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Trang sau"
              onClick={() => flipRef.current?.flipNext()}
              className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E4E1E0] bg-white text-[20px] leading-none text-[#5F5D5D] shadow-sm transition-colors duration-fast ease-base hover:border-[#880206] hover:text-[#880206] min-[900px]:h-12 min-[900px]:w-12"
            >
              ›
            </button>
          </>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 min-[900px]:mt-6 min-[900px]:gap-3">
        {status === "ready" && pageCount > 0 && (
          <span className="text-[11px] tabular-nums text-[#8A8785] wide:text-[13px]">
            {Math.min(page + 1, pageCount)} / {pageCount}
          </span>
        )}
        <a
          href={pdfUrl}
          download
          className="inline-flex items-center gap-2 rounded-md border border-[#880206] px-5 py-3 text-[12px] font-semibold text-[#880206] transition-colors duration-fast ease-base hover:bg-[#FBEFE3] wide:text-[14px]"
        >
          {downloadLabel} <Icon name="arrow-right" size={13} />
        </a>
      </div>
    </>
  );
}
