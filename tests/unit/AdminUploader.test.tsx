import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Uploader } from "@/components/admin/Uploader";

describe("Uploader", () => {
  it("shows a retry action in the error state", () => {
    render(<Uploader state="error" />);
    expect(screen.getByRole("button", { name: /thử lại/i })).toBeInTheDocument();
  });

  it("shows an accessible progress indicator while uploading", () => {
    render(<Uploader state="uploading" />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows an upload prompt in the empty state", () => {
    render(<Uploader state="empty" />);
    expect(screen.getByRole("button", { name: /tải ảnh/i })).toBeInTheDocument();
  });
});
