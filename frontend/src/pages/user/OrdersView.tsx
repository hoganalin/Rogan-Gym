import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { getUserCreditPackage } from "../../api/users";
import type { CreditPurchase } from "../../types/api";

export default function OrdersView() {
  const [purchases, setPurchases] = useState<CreditPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getUserCreditPackage()
      .then(({ data }) => {
        if (!cancelled) setPurchases(data);
      })
      .catch(() => {
        if (!cancelled) setError("載入購買紀錄失敗，請稍後再試。");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1 className="font-display text-[34px] font-extrabold tracking-tight">購買紀錄</h1>

      {loading && <p className="mt-8 text-muted">載入中…</p>}
      {error && <p className="mt-8 text-rose-400">{error}</p>}

      {!loading && !error && (
        <div className="mt-8 flex flex-col gap-3">
          {purchases.map((purchase, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-md border border-line bg-surface px-6 py-5"
            >
              <div>
                <h3 className="font-bold">{purchase.name ?? "已下架方案"}</h3>
                <p className="mt-1.5 font-mono text-xs text-[#8a857f]">
                  {dayjs(purchase.purchase_at).format("YYYY/M/D HH:mm")} · {purchase.purchased_credits} 堂
                </p>
              </div>
              <p className="font-display text-lg font-bold text-brand-500">
                NT$&thinsp;{purchase.price_paid.toLocaleString()}
              </p>
            </div>
          ))}
          {purchases.length === 0 && <p className="text-muted">目前沒有購買紀錄。</p>}
        </div>
      )}
    </div>
  );
}
