import { Icon } from "@/components/icons";

export type UploaderState = "empty" | "uploading" | "success" | "error";

interface UploaderProps {
  state?: UploaderState;
  onRetry?: () => void;
  onClick?: () => void;
  /**
   * The actual reason from uploadMediaAction (file too large, unsupported
   * type, storage not configured...). Every form used to swallow it and show
   * only "Tải lên thất bại", leaving the operator with nothing to act on.
   */
  errorMessage?: string;
}

export function Uploader({ state = "empty", onRetry, onClick, errorMessage }: UploaderProps) {
  if (state === "uploading") {
    return (
      <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-line bg-soft text-muted">
        <div
          role="progressbar"
          aria-label="Đang tải lên"
          className="h-2 w-2/3 overflow-hidden rounded-full bg-line"
        >
          <div className="h-full w-2/3 animate-pulse bg-primary" />
        </div>
        <span className="text-body">Đang tải lên...</span>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div
        role="alert"
        className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-error bg-[#FDF1F1] p-3 text-center text-error"
      >
        <span className="text-body font-bold">Tải lên thất bại</span>
        {errorMessage && <span className="text-body leading-snug">{errorMessage}</span>}
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 rounded-md border border-error px-4 py-2 text-label text-error transition-colors duration-fast ease-base hover:bg-surface"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-success bg-soft text-success">
        <Icon name="check" size={24} className="text-success" />
        <span className="text-body">Tải lên thành công</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-line text-muted hover:border-primary hover:text-primary"
    >
      <Icon name="upload" size={24} />
      <span className="text-body">Tải ảnh, video hoặc dán link</span>
    </button>
  );
}
