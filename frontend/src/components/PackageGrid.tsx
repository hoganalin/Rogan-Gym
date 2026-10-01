import { Icon } from "./ClubUI";
import type { CreditPackage } from "../types/api";
export function PackageGrid({
  packages,
  onBuy,
}: {
  packages: CreditPackage[];
  onBuy: (id: string, name: string) => void;
  scrollFx?: boolean;
}) {
  const sorted = [...packages].sort((a, b) => a.price - b.price);
  const best = sorted
    .filter((p) => p.credit_amount > 0)
    .reduce<CreditPackage | undefined>(
      (a, p) =>
        !a || p.price / p.credit_amount < a.price / a.credit_amount ? p : a,
      undefined,
    );
  return (
    <div className="package-grid">
      {sorted.map((pkg) => (
        <article
          key={pkg.id}
          className={`package-card ${pkg.id === best?.id ? "featured" : ""}`}
        >
          <h3>{pkg.name}</h3>
          <p className="package-credits">
            {pkg.credit_amount} 堂訓練，依照自己的步調安排
          </p>
          <div className="package-price">
            <small>NT$</small>
            {pkg.price.toLocaleString()}
          </div>
          <p className="package-unit">
            每堂約 NT${" "}
            {pkg.credit_amount > 0
              ? Math.round(pkg.price / pkg.credit_amount).toLocaleString()
              : "—"}
          </p>
          <ul className="package-perks">
            <li>
              <Icon name="check" size={16} />
              自由選擇平台上的教練課程
            </li>
            <li>
              <Icon name="check" size={16} />
              每報名一堂課，使用 1 堂額度
            </li>
            <li>
              <Icon name="check" size={16} />
              在會員課表管理你的預約
            </li>
          </ul>
          <button
            className={`btn ${pkg.id === best?.id ? "btn-primary" : "btn-secondary"}`}
            onClick={() => onBuy(pkg.id, pkg.name)}
          >
            購買方案
            <Icon size={18} />
          </button>
        </article>
      ))}
      {!sorted.length && <p>目前沒有可購買的方案。</p>}
    </div>
  );
}
