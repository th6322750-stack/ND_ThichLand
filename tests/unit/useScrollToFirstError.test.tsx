import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useScrollToFirstError } from "@/lib/useScrollToFirstError";

/**
 * Regression test for a real client-reported bug: a long admin form (BĐS)
 * showed only a generic "Vui lòng kiểm tra lại thông tin." banner at the
 * top on a failed save, with the actual per-field reason further down the
 * page, out of view — the client had no way to tell what was wrong. This
 * hook is what makes the page jump straight to it instead.
 */
describe("useScrollToFirstError", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("does nothing when there are no field errors", () => {
    document.body.innerHTML = '<input aria-invalid="true" />';
    const scrollSpy = vi.spyOn(HTMLElement.prototype, "scrollIntoView");
    renderHook(() => useScrollToFirstError({}));
    expect(scrollSpy).not.toHaveBeenCalled();
  });

  it("scrolls to and focuses the first invalid field in document order", () => {
    document.body.innerHTML = `
      <input name="roomNo" />
      <select name="propertyType" aria-invalid="true"></select>
      <input name="location" aria-invalid="true" />
    `;
    const scrollSpy = vi.spyOn(HTMLElement.prototype, "scrollIntoView");
    renderHook(() => useScrollToFirstError({ propertyType: "bad", location: "bad" }));

    expect(scrollSpy).toHaveBeenCalledTimes(1);
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
    expect(document.activeElement).toBe(document.querySelector('[name="propertyType"]'));
  });

  it("re-scrolls on a repeat failed save, even if the same field is still invalid", () => {
    document.body.innerHTML = '<input name="area" aria-invalid="true" />';
    const scrollSpy = vi.spyOn(HTMLElement.prototype, "scrollIntoView");
    const { rerender } = renderHook(({ fieldErrors }) => useScrollToFirstError(fieldErrors), {
      initialProps: { fieldErrors: { area: "Diện tích không hợp lệ" } },
    });
    expect(scrollSpy).toHaveBeenCalledTimes(1);

    // A fresh object with the identical message, as a second failed save
    // attempt would produce — not the same reference.
    rerender({ fieldErrors: { area: "Diện tích không hợp lệ" } });
    expect(scrollSpy).toHaveBeenCalledTimes(2);
  });
});
