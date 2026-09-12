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
      <h1 className="text-2xl font-bold">購買紀錄</h1>

      {loading && <p className="mt-6 text-slate-500">載入中…</p>}
      {error && <p className="mt-6 text-rose-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-6 flex flex-col gap-3">
          {purchases.map((purchase, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
            >
              <div>
                <h3 className="font-semibold">{purchase.name ?? "已下架方案"}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {dayjs(purchase.purchase_at).format("YYYY/M/D HH:mm")}・{purchase.purchased_credits} 堂
                </p>
              </div>
              <p className="font-semibold text-brand-600">${purchase.price_paid}</p>
            </div>
          ))}
          {purchases.length === 0 && <p className="text-slate-500">目前沒有購買紀錄。</p>}
        </div>
      )}
    </div>
  );
}
