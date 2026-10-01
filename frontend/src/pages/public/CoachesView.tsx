import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getCoachCards } from "../../api/coachesPublic";
import {
  CoachTile,
  DataState,
  Icon,
  PageHeading,
} from "../../components/ClubUI";
import type { CoachCard } from "../../types/api";
const PER_PAGE = 9;
export default function CoachesView() {
  const [coaches, setCoaches] = useState<CoachCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const picked = useMemo(() => params.getAll("skill"), [params]);
  const available = params.get("available") === "1";
  const page = Math.max(1, Number(params.get("page")) || 1);
  function change(key: string, value: string) {
    setParams(
      (p) => {
        if (value) p.set(key, value);
        else p.delete(key);
        p.delete("page");
        return p;
      },
      { replace: true },
    );
  }
  function toggleSkill(skill: string) {
    setParams((p) => {
      const currentSkills = p.getAll("skill");
      const next = currentSkills.includes(skill)
        ? currentSkills.filter((s) => s !== skill)
        : [...currentSkills, skill];
      p.delete("skill");
      p.delete("page");
      next.forEach((s) => p.append("skill", s));
      return p;
    }, { replace: true });
  }
  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(null);
    getCoachCards(100, 1)
      .then(({ data }) => {
        if (live) setCoaches(data);
      })
      .catch(() => {
        if (live) setError("載入教練列表失敗，請重新試一次。");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [attempt]);
  const skills = useMemo(
    () => [...new Set(coaches.flatMap((c) => c.skills))],
    [coaches],
  );
  const filtered = useMemo(
    () =>
      coaches.filter((c) => {
        const q = query.trim().toLocaleLowerCase();
        return (
          (!q ||
            `${c.name} ${c.description} ${c.skills.join(" ")}`
              .toLocaleLowerCase()
              .includes(q)) &&
          (!picked.length || c.skills.some((s) => picked.includes(s))) &&
          (!available || c.upcomingCourses.length > 0)
        );
      }),
    [coaches, query, picked, available],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  function paginate(next: number) {
    setParams((p) => {
      p.set("page", String(next));
      return p;
    });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  return (
    <div className="club-container page-space">
      <PageHeading
        title="找到合拍的訓練夥伴。"
        action={
          <Link className="text-link" to="/schedule">
            先看有空的時段
            <Icon />
          </Link>
        }
      >
        從專長、教學經驗到開課時間，找到適合你的教練。
      </PageHeading>
      <div className="filter-panel">
        <label className="search-field">
          <Icon name="search" />
          <input
            aria-label="搜尋教練姓名或專項"
            placeholder="搜尋教練姓名或專項"
            value={query}
            onChange={(e) => change("q", e.target.value)}
          />
        </label>
        <label className="check-filter">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => change("available", e.target.checked ? "1" : "")}
          />
          只看有開課的教練
        </label>
        <div className="filter-chips" aria-label="教練專長篩選">
          <button
            aria-pressed={!picked.length}
            className={!picked.length ? "selected" : ""}
            onClick={() => change("skill", "")}
          >
            全部專長
          </button>
          {skills.map((s) => (
            <button
              key={s}
              aria-pressed={picked.includes(s)}
              className={picked.includes(s) ? "selected" : ""}
              onClick={() => toggleSkill(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      {loading || error ? (
        <DataState
          loading={loading}
          error={error}
          onRetry={() => setAttempt((a) => a + 1)}
        />
      ) : (
        <>
          <div className="results-line" role="status">
            <span>
              找到 <strong>{filtered.length}</strong> 位教練
            </span>
            {(query || picked.length > 0 || available) && (
              <button className="text-link" onClick={() => setParams({})}>
                清除篩選
              </button>
            )}
          </div>
          {filtered.length ? (
            <div className="coach-grid">
              {filtered
                .slice((current - 1) * PER_PAGE, current * PER_PAGE)
                .map((c) => (
                  <CoachTile key={c.id} coach={c} />
                ))}
            </div>
          ) : (
            <DataState empty="找不到符合條件的教練，請更換關鍵字或清除篩選。" />
          )}
          {totalPages > 1 && (
            <nav className="pagination" aria-label="教練分頁">
              <button
                className="btn btn-secondary"
                disabled={current === 1}
                onClick={() => paginate(current - 1)}
              >
                上一頁
              </button>
              <span>
                {current} / {totalPages}
              </span>
              <button
                className="btn btn-secondary"
                disabled={current === totalPages}
                onClick={() => paginate(current + 1)}
              >
                下一頁
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
