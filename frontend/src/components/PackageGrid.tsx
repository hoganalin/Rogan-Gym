import type { CreditPackage } from "../types/api";

const PACKAGE_PERKS = [
  "適合想先體驗的新會員",
  "單堂均價最省，長期訓練首選",
  "堂數最多，排課彈性最大",
];

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
    <div
      {...(scrollFx ? { "data-pkg-track": "1" } : {})}
      className="grid grid-cols-1 gap-5 sm:grid-cols-3"
    >
      {sorted.map((pkg, i) => {
        const featured = sorted.length === 3 && i === 1;
        const unit = Math.round(pkg.price / pkg.credit_amount);
        const perk = PACKAGE_PERKS[Math.min(i, PACKAGE_PERKS.length - 1)];
        return (
          <div
            key={pkg.id}
            {...(scrollFx ? { "data-rise": "1", "data-pkg": "1" } : {})}
            className={`relative rounded-md border p-8 ${
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
              {["可報名全站所有教練課程", "取消報名自動退回堂數", perk].map((line) => (
                <div key={line} className="flex gap-2.5 text-[13px] font-light text-[#cfc9c2]">
                  <span className="text-[11px] text-brand-500">◆</span>
                  {line}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => onBuy(pkg.id, pkg.name)}
              className={`mt-7 w-full rounded-[4px] py-3.5 text-sm font-bold ${
                featured
                  ? "bg-brand-500 text-ink hover:bg-brand-400"
                  : "border border-[#2f3238] bg-transparent text-body hover:border-brand-400"
              }`}
            >
              購買方案
            </button>
          </div>
        );
      })}
      {sorted.length === 0 && <p className="text-muted sm:col-span-3">目前沒有可購買的方案。</p>}
    </div>
  );
}
