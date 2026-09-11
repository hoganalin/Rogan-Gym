import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCoaches } from "../../api/coachesPublic";
import type { CoachListItem } from "../../types/api";

const PER_PAGE = 6;

export default function CoachesView() {
  const [coaches, setCoaches] = useState<CoachListItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getCoaches(PER_PAGE, page)
      .then(({ data }) => {
        if (!cancelled) setCoaches(data);
      })
      .catch(() => {
        if (!cancelled) setError("載入教練列表失敗，請稍後再試。");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div>
      <h1 className="text-2xl font-bold">教練列表</h1>
      <p className="mt-2 text-slate-600">瀏覽 R Fitness 所有教練，尋找適合你的訓練夥伴。</p>

      {loading && <p className="mt-6 text-slate-500">載入中…</p>}
      {error && <p className="mt-6 text-rose-600">{error}</p>}

      {!loading && !error && (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {coaches.map((coach) => (
              <Link
                key={coach.id}
                to={`/coaches/${coach.id}`}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 hover:border-brand-400"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 font-display font-bold text-brand-700">
                  {coach.name.charAt(0)}
                </span>
                <span className="font-medium">{coach.name}</span>
              </Link>
            ))}
          </div>

          {coaches.length === 0 && <p className="mt-6 text-slate-500">目前沒有教練資料。</p>}

          <div className="mt-6 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-40"
            >
              上一頁
            </button>
            <span className="text-sm text-slate-500">第 {page} 頁</span>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={coaches.length < PER_PAGE}
              className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-40"
            >
              下一頁
            </button>
          </div>
        </>
      )}
    </div>
  );
}
