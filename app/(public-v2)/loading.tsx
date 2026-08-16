/**
 * Every public-v2 route is force-dynamic and reads Google Sheets on request,
 * so a slow provider used to leave the visitor on the previous page with no
 * feedback at all. This holds the page's geometry (hero band + a card grid)
 * so nothing jumps when the real content lands.
 */
export default function PublicV2Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Đang tải nội dung…</span>
      <div className="h-[240px] animate-pulse bg-[#F1EFEE] min-[900px]:h-[430px] wide:h-[460px]" />
      <div className="v2-container py-6">
        <div className="h-4 w-[160px] animate-pulse rounded bg-[#F1EFEE]" />
        <div className="mt-6 grid grid-cols-2 gap-3 min-[900px]:grid-cols-4 min-[900px]:gap-5">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-[#EDEBEA]">
              <div className="aspect-[3/2] animate-pulse bg-[#F1EFEE]" />
              <div className="space-y-2 p-3">
                <div className="h-3 w-3/4 animate-pulse rounded bg-[#F1EFEE]" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-[#F1EFEE]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
