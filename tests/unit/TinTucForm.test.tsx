import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { TinTucForm } from "@/components/admin/TinTucForm";
import type { NewsRecord } from "@/lib/server/news/repository";

const { uploadMediaActionMock } = vi.hoisted(() => ({
  uploadMediaActionMock: vi.fn(),
}));

vi.mock("@/app/actions/media", () => ({
  uploadMediaAction: uploadMediaActionMock,
}));

vi.mock("@/app/actions/news", () => ({
  saveNewsAction: vi.fn(),
}));

const mockRouter = {
  back: () => {},
  forward: () => {},
  refresh: () => {},
  push: () => {},
  replace: () => {},
  prefetch: () => {},
} as unknown as Parameters<typeof AppRouterContext.Provider>[0]["value"];

const initial: NewsRecord = {
  id: "news:1",
  slug: "kinh-nghiem-thue-nha",
  title: "Kinh nghiệm thuê nhà",
  category: "Kinh nghiệm",
  publishedAt: "2026-08-22",
  readMinutes: 3,
  excerpt: "Mô tả",
  cover: "/images/old-cover.jpg",
  sections: [{ heading: "Mở đầu", body: "Nội dung" }],
  published: true,
  createdAt: "2026-08-22T00:00:00.000Z",
  updatedAt: "2026-08-22T00:00:00.000Z",
};

function renderForm() {
  return render(
    <AppRouterContext.Provider value={mockRouter}>
      <TinTucForm initial={initial} />
    </AppRouterContext.Provider>,
  );
}

describe("TinTucForm cover image", () => {
  beforeEach(() => {
    uploadMediaActionMock.mockReset();
  });

  it("shows an explicit replace control that opens the file picker", async () => {
    const user = userEvent.setup();
    const { container } = renderForm();
    const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const inputClick = vi.spyOn(fileInput, "click");

    await user.click(screen.getByRole("button", { name: "Thay ảnh bìa" }));

    expect(inputClick).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Gỡ ảnh bìa" })).toBeInTheDocument();
  });

  it("uploads a replacement and updates the preview", async () => {
    const user = userEvent.setup();
    uploadMediaActionMock.mockResolvedValueOnce({
      ok: true,
      record: { webViewLink: "/api/media/media%3Anew-cover" },
    });
    const { container } = renderForm();
    const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(fileInput).not.toBeNull();

    await user.upload(fileInput!, new File(["new image"], "new-cover.jpg", { type: "image/jpeg" }));

    await waitFor(() => {
      expect(screen.getByRole("img", { name: "Ảnh bìa bài viết" })).toHaveAttribute(
        "src",
        "/api/media/media%3Anew-cover",
      );
    });
    expect(uploadMediaActionMock).toHaveBeenCalledOnce();
  });

  it("keeps the current cover and explains the error when replacement fails", async () => {
    const user = userEvent.setup();
    uploadMediaActionMock.mockResolvedValueOnce({ ok: false, error: "Dung lượng ảnh quá lớn." });
    const { container } = renderForm();
    const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]');

    await user.upload(fileInput!, new File(["large image"], "large.jpg", { type: "image/jpeg" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Dung lượng ảnh quá lớn.");
    expect(screen.getByRole("img", { name: "Ảnh bìa bài viết" })).toHaveAttribute(
      "src",
      "/images/old-cover.jpg",
    );
  });
});
