import { useEffect, useState } from "react";
import { getCreditPackages } from "../../api/creditPackage";
import { usePackageActions } from "../../hooks/usePackageActions";
import type { CreditPackage } from "../../types/api";

export default function FitnessPlans() {
  const { buyPackage } = usePackageActions();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getCreditPackages()
      .then(({ data }) => {
        if (!cancelled) setPackages(data);
      })
      .catch(() => {
        if (!cancelled) setError("載入方案失敗，請稍後再試。");
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
      <h1 className="text-2xl font-bold">健身方案</h1>
      <p className="mt-2 text-slate-600">購買堂數方案，開始報名課程。</p>

      {loading && <p className="mt-6 text-slate-500">載入中…</p>}
      {error && <p className="mt-6 text-rose-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {packages.map((pkg) => (
            <div key={pkg.id} className="flex flex-col rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="font-semibold">{pkg.name}</h3>
              <p className="mt-2 text-3xl font-bold text-brand-600">${pkg.price}</p>
              <p className="mt-1 text-sm text-slate-500">{pkg.credit_amount} 堂</p>
              <button
                type="button"
                onClick={() => buyPackage(pkg.id, pkg.name)}
                className="mt-4 rounded bg-brand-600 py-2 text-sm text-white"
              >
                購買
              </button>
            </div>
          ))}
          {packages.length === 0 && <p className="text-slate-500">目前沒有可購買的方案。</p>}
        </div>
      )}
    </div>
  );
}
