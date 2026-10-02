import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { getUserCreditPackage } from "../../api/users";
import type { CreditPurchase } from "../../types/api";
import { StatusText, WorkspaceHeading } from "../../components/ClubUI";

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
      <WorkspaceHeading title="購買紀錄" />

      {loading && <StatusText className="mt-8">載入中…</StatusText>}
      {error && (
        <StatusText error className="mt-8">
          {error}
        </StatusText>
      )}

      {!loading && !error && (
        <div className="mt-8 flex flex-col gap-3">
          {purchases.map((purchase, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-(--radius-control) border border-line bg-surface px-6 py-5"
            >
              <div>
                <h3 className="font-bold">{purchase.name ?? "已下架方案"}</h3>
                <p className="mt-1.5 font-mono text-xs text-muted">
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
