import type { CreditPackage } from "../types/api";

const PACKAGE_PERKS: Record<string, string[]> = {
  體驗方案: [
    "4 堂輕量入門，適合初次體驗",
    "探索教練風格，找到喜歡的課程",
    "從小目標開始，踏出運動第一步",
  ],
  標準方案: [
    "16 堂循序累積，建立運動習慣",
    "每堂 NT$ 550，比體驗方案省 50 元",
    "適合規律排課，穩定推進訓練目標",
  ],
  年度方案: [
    "48 堂充裕額度，適合長期訓練",
    "每堂 NT$ 500，三種方案中最優惠",
    "搭配多元課程，持續挑戰進階目標",
  ],
};

export function PackageGrid({
  packages,
  onBuy,
  scrollFx = false,
}: {
  packages: CreditPackage[];
  onBuy: (id: string, name: string) => void;
  scrollFx?: boolean;
}) {
  const sorted = [...packages].sort((a, b) => a.price - b.price);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      {sorted.map((pkg) => {
        const featured = pkg.name === "年度方案";
        const unit = Math.round(pkg.price / pkg.credit_amount);
        const perks = PACKAGE_PERKS[pkg.name] ?? [
          "可報名全站所有教練課程",
          "取消報名自動退回堂數",
          "依照自己的步調安排訓練",
        ];
        return (
          <div
            key={pkg.id}
            {...(scrollFx ? { "data-rise": "1" } : {})}
          >
          <div
            className={`package-card relative h-full rounded-md border p-8 ${
              featured ? "border-[#4a3b33] bg-[#15120f]" : "border-line bg-surface"
            }`}
          >
            {featured && (
              <span className="absolute -top-2.5 left-8 rounded-[3px] bg-brand-500 px-2.5 py-1.5 font-mono text-[11px] font-bold tracking-wide text-ink">
                BEST VALUE
              </span>
            )}
            <h3 className="text-lg font-bold">{pkg.name}</h3>
            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="font-display text-lg font-medium text-[#8a857f]">NT$</span>
              <span className="font-display text-[54px] font-black tracking-tight">
                {pkg.price.toLocaleString()}
              </span>
            </div>
            <div className="mt-3.5 font-mono text-xs text-brand-500">
              {pkg.credit_amount} 堂 ／ 每堂 NT$ {unit.toLocaleString()}
            </div>
            <div className="mt-6 h-px bg-line" />
            <div className="mt-6 flex flex-col gap-3">
              {perks.map((line) => (
                <div key={line} className="flex gap-2.5 text-[13px] font-light text-[#cfc9c2]">
                  <span className="text-[11px] text-brand-500">◆</span>
                  {line}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => onBuy(pkg.id, pkg.name)}
              className={`mt-7 w-full cursor-pointer rounded-[4px] py-3.5 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400 motion-reduce:transition-none ${
                featured
                  ? "bg-brand-500 text-ink hover:bg-brand-400"
                  : "border border-[#2f3238] bg-transparent text-body hover:border-brand-400"
              }`}
            >
              購買方案
            </button>
          </div>
          </div>
        );
      })}
      {sorted.length === 0 && <p className="text-muted sm:col-span-3">目前沒有可購買的方案。</p>}
    </div>
  );
}
