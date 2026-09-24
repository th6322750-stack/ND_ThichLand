/**
 * `page-flip` (StPageFlip) ships no type definitions, so this declares the
 * slice of its API ProfileFlipbook2 uses. Kept deliberately narrow: anything
 * added here should be something the component actually calls.
 */
declare module "page-flip" {
  export interface PageFlipSettings {
    width: number;
    height: number;
    size?: "fixed" | "stretch";
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    /** Renders the first/last page as a hard cover standing alone. */
    showCover?: boolean;
    /** Falls back to one page at a time when the viewport is too narrow for a spread. */
    usePortrait?: boolean;
    maxShadowOpacity?: number;
    mobileScrollSupport?: boolean;
    drawShadow?: boolean;
    flippingTime?: number;
    useMouseEvents?: boolean;
    swipeDistance?: number;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
  }

  export class PageFlip {
    constructor(element: HTMLElement, settings: PageFlipSettings);
    loadFromImages(imagesHref: string[]): void;
    flipNext(): void;
    flipPrev(): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
    on(event: "flip", callback: (e: { data: number }) => void): void;
    on(
      event: "init" | "update",
      callback: (e: { data: { page: number; mode: "portrait" | "landscape" } }) => void,
    ): void;
    on(event: "changeOrientation", callback: (e: { data: "portrait" | "landscape" }) => void): void;
    on(event: "changeState", callback: (e: { data: string }) => void): void;
    destroy(): void;
  }
}
