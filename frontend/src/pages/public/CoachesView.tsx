import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getCoachCards } from "../../api/coachesPublic";
import { useScrollFx } from "../../hooks/useScrollFx";
import { CoachMedia } from "../../components/CoachMedia";
import type { CoachCard } from "../../types/api";

const SAMPLE_SIZE = 100;
const PER_PAGE = 9;

export default function CoachesView() {
  const [coaches, setCoaches] = useState<CoachCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    getCoachCards(SAMPLE_SIZE, 1)
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
  }, []);

  // 前端過濾／排序／分頁：不新增任何 API 參數，一律用已載入的資料在前端處理。
  const skillOptions = useMemo(() => {
    const set = new Set<string>();
    coaches.forEach((c) => c.skills.forEach((s) => set.add(s)));
    return Array.from(set);
  }, [coaches]);

  const filtered = useMemo(() => {
    const q = query.trim();
    return coaches.filter((c) => {
      const matchQuery = !q || c.name.includes(q) || c.skills.some((s) => s.includes(q)) || c.description.includes(q);
      const matchSkill = picked.length === 0 || c.skills.some((s) => picked.includes(s));
      return matchQuery && matchSkill;
    });
  }, [coaches, query, picked]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  function toggleSkill(name: string) {
    setPage(1);
    setPicked((prev) => (prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]));
  }

  function handleQueryChange(value: string) {
    setPage(1);
    setQuery(value);
  }

  // 同 HomeView：卡片是 API 回來後才 render，把 useScrollFx 延到資料載入完成才 mount。
  if (loading) {
    return <div className="mx-auto max-w-6xl px-6 py-24 text-center text-muted">載入中…</div>;
  }
  if (error) {
    return <div className="mx-auto max-w-6xl px-6 py-24 text-center text-rose-400">{error}</div>;
  }

  return (
    <CoachesContent
      coaches={coaches}
      filtered={filtered}
      visible={visible}
      skillOptions={skillOptions}
      query={query}
      picked={picked}
      currentPage={currentPage}
      totalPages={totalPages}
      onQueryChange={handleQueryChange}
      onToggleSkill={toggleSkill}
      onPageChange={setPage}
    />
  );
}

function CoachesContent({
  coaches,
  filtered,
  visible,
  skillOptions,
  query,
  picked,
  currentPage,
  totalPages,
  onQueryChange,
  onToggleSkill,
  onPageChange,
}: {
  coaches: CoachCard[];
  filtered: CoachCard[];
  visible: CoachCard[];
  skillOptions: string[];
  query: string;
  picked: string[];
  currentPage: number;
  totalPages: number;
  onQueryChange: (value: string) => void;
  onToggleSkill: (name: string) => void;
  onPageChange: (updater: (p: number) => number) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  useScrollFx(root);

  // 分頁切換後卡片節點會整批換掉，重新量一次捲動位置。
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [currentPage]);

  return (
    <div ref={root} className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-[46px]">教練列表</h1>
          <p className="mt-3.5 text-[15px] font-light text-muted">瀏覽 R Fitness 所有教練，尋找適合你的訓練夥伴。</p>
        </div>
        <div className="font-mono text-xs text-faint">
          {filtered.length} / {coaches.length} COACHES
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3.5">
        <div className="flex min-w-[280px] flex-1 items-center gap-3 rounded-[4px] border border-[#2a2d33] bg-surface px-4">
          <span className="text-faint">⌕</span>
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="搜尋教練姓名或專項"
            className="flex-1 bg-transparent py-[15px] text-[15px] text-body outline-none placeholder:text-faint"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {skillOptions.map((name) => {
            const on = picked.includes(name);
            return (
              <button
                key={name}
                type="button"
                onClick={() => onToggleSkill(name)}
                className={`rounded-[4px] px-4 py-[13px] text-sm font-medium ${
                  on ? "border border-brand-500 bg-brand-500/10 text-[#ffb494]" : "border border-[#2a2d33] text-muted"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
        {visible.map((coach) => (
          <Link
            key={coach.id}
            to={`/coaches/${coach.id}`}
            data-rise="1"
            className="block overflow-hidden rounded-md border border-line bg-surface hover:border-[#4a3b33]"
          >
            <div className="relative h-[280px] bg-[#16181b]">
              <CoachMedia src={coach.profile_image_url} name={coach.name} className="h-full w-full" />
              <span className="absolute top-3.5 right-3.5 rounded-[3px] border border-[#2f3238] bg-ink/70 px-2.5 py-1.5 font-mono text-[11px] text-brand-500">
                {coach.experience_years}Y
              </span>
            </div>
            <div className="p-5">
              <div className="flex items-baseline justify-between gap-3">
                <div className="text-xl font-bold">{coach.name}</div>
                <span className="font-mono text-[11px] text-faint">{coach.upcomingCourses.length} 堂開課中</span>
              </div>
              <p className="mt-2.5 line-clamp-2 text-[13px] leading-relaxed font-light text-[#8a857f]">
                {coach.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {coach.skills.slice(0, 4).map((sk) => (
                  <span key={sk} className="rounded-[3px] border border-[#2a2d33] px-2.5 py-1 text-[11px] text-[#cfc9c2]">
                    {sk}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-[#1d1f24] pt-4">
                <span className="text-[13px] font-medium text-brand-500">查看課表與履歷</span>
                <span className="text-brand-500">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 rounded-md border border-dashed border-[#2a2d33] p-14 text-center">
          <div className="text-lg font-bold">找不到符合條件的教練</div>
          <p className="mt-3 text-sm font-light text-[#8a857f]">試著清除技能篩選，或用其他關鍵字搜尋。</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => onPageChange((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-[4px] border border-[#2a2d33] px-4 py-2.5 text-[13px] font-medium disabled:text-[#4f4a45]"
          >
            上一頁
          </button>
          <span className="rounded-[4px] bg-brand-500 px-4 py-3 font-mono text-[13px] font-bold text-ink">{currentPage}</span>
          <span className="font-mono text-[13px] text-faint">/ {totalPages}</span>
          <button
            type="button"
            onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-[4px] border border-[#2a2d33] px-4 py-2.5 text-[13px] font-medium disabled:text-[#4f4a45]"
          >
            下一頁
          </button>
        </div>
      )}
    </div>
  );
}
