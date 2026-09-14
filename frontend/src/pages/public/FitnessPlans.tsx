import { useEffect, useState } from "react";
import { getCreditPackages } from "../../api/creditPackage";
import { usePackageActions } from "../../hooks/usePackageActions";
import { PackageGrid } from "../../components/PackageGrid";
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
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="text-center">
        <div className="font-mono text-xs tracking-[.2em] text-brand-500">CREDIT PACKAGES</div>
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight md:text-[46px]">健身方案</h1>
        <p className="mt-3 text-[15px] font-light text-muted">買堂數，報名任一位教練的課程。每堂均價由方案價格與堂數換算。</p>
      </div>

      {loading && <p className="mt-12 text-center text-muted">載入中…</p>}
      {error && <p className="mt-12 text-center text-rose-400">{error}</p>}

      {!loading && !error && (
        <div className="mt-12">
          <PackageGrid packages={packages} onBuy={buyPackage} />
        </div>
      )}
    </div>
  );
}
