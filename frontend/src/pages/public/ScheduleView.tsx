import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { getCoachCards } from "../../api/coachesPublic";
import { useCourseActions } from "../../hooks/useCourseActions";
import {
  CourseList,
  DataState,
  Icon,
  PageHeading,
} from "../../components/ClubUI";
import type { PublicCourse } from "../../types/api";
const PAGE_SIZE = 6;

export default function ScheduleView() {
  const resultsRef = useRef<HTMLDivElement>(null);
  const { bookCourse } = useCourseActions();
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "",
    date = params.get("date") || "",
    skill = params.get("skill") || "";
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
  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(null);
    async function load() {
      for (let n = 1; n <= 3; n++) {
        try {
          const { data } = await getCoachCards(100, 1);
          if (live) setCourses(data.flatMap((c) => c.upcomingCourses));
          return;
        } catch {
          if (!live) return;
          if (n < 3) await new Promise((r) => window.setTimeout(r, n * 1000));
        }
      }
      if (live) setError("暫時無法載入課程，請重新試一次。");
    }
    void load().finally(() => {
      if (live) setLoading(false);
    });
    return () => {
      live = false;
    };
  }, [attempt]);
  const skills = [...new Set(courses.map((c) => c.skill_name))];
  const filtered = useMemo(
    () =>
      courses
        .filter(
          (c) =>
            (!query ||
              `${c.name} ${c.coach_name} ${c.skill_name} ${c.description}`
                .toLocaleLowerCase()
                .includes(query.toLocaleLowerCase())) &&
            (!date || dayjs(c.start_at).format("YYYY-MM-DD") === date) &&
            (!skill || c.skill_name === skill),
        )
        .sort((a, b) => Date.parse(a.start_at) - Date.parse(b.start_at)),
    [courses, query, date, skill],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageParam = params.get("page");
  const requestedPage = Number(pageParam || 1);
  const currentPage = Number.isSafeInteger(requestedPage)
    ? Math.min(totalPages, Math.max(1, requestedPage))
    : 1;
  const start = (currentPage - 1) * PAGE_SIZE;
  const visibleCourses = filtered.slice(start, start + PAGE_SIZE);
  const firstPage = Math.max(1, Math.min(currentPage - 1, totalPages - 2));
  const pageNumbers = Array.from(
    { length: Math.min(3, totalPages) },
    (_, index) => firstPage + index,
  );

  useEffect(() => {
    if (loading || error || !pageParam) return;
    if (pageParam !== String(currentPage) || currentPage === 1) {
      setParams(previous => {
        const next = new URLSearchParams(previous);
        if (currentPage === 1) next.delete("page");
        else next.set("page", String(currentPage));
        return next;
      }, { replace: true });
    }
  }, [loading, error, pageParam, currentPage, setParams]);

  function paginate(page: number) {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      if (page === 1) next.delete("page");
      else next.set("page", String(page));
      return next;
    });
    resultsRef.current?.focus({ preventScroll: true });
    resultsRef.current?.scrollIntoView({ block: "start" });
  }

  return (
    <div className="club-container page-space">
      <PageHeading
        title="把下一堂課，排進生活。"
        action={
          <Link className="text-link" to="/user/dashboard">
            我的課表
            <Icon />
          </Link>
        }
      >
        依時間與專項選課。登入會員後，使用 1 堂額度完成報名。
      </PageHeading>
      <div className="filter-panel schedule-filters">
        <label className="search-field">
          <Icon name="search" />
          <input
            aria-label="搜尋課程或教練"
            placeholder="搜尋課程或教練"
            value={query}
            onChange={(e) => change("q", e.target.value)}
          />
        </label>
        <label className="select-field">
          開課日期
          <input
            aria-label="開課日期"
            type="date"
            value={date}
            onChange={(e) => change("date", e.target.value)}
          />
        </label>
        <label className="select-field">
          訓練專項
          <select
            value={skill}
            onChange={(e) => change("skill", e.target.value)}
          >
            <option value="">全部專項</option>
            {skills.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      {loading || error ? (
        <DataState
          loading={loading}
          error={error}
          onRetry={() => setAttempt((a) => a + 1)}
        />
      ) : (
        <>
          <div className="results-line schedule-results" role="status" tabIndex={-1} ref={resultsRef}>
            <span>
              共 <strong>{filtered.length}</strong> 堂課程
              {filtered.length > 0 && ` · 顯示 ${start + 1}–${start + visibleCourses.length} 堂`}
              <span className="schedule-sort-label"> · 依開課時間排序</span>
            </span>
            {(query || date || skill) && (
              <button className="text-link" onClick={() => setParams({})}>
                清除篩選
              </button>
            )}
          </div>
          {filtered.length ? (
            <>
              <CourseList courses={visibleCourses} onBook={bookCourse} />
              {totalPages > 1 && (
                <nav className="pagination schedule-pagination" aria-label="課程分頁">
                  <button className="page-control" disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)} aria-label="上一頁">←</button>
                  {firstPage > 1 && <span className="page-ellipsis" aria-hidden="true">…</span>}
                  {pageNumbers.map(page => (
                    <button key={page} className="page-control" aria-label={`第 ${page} 頁`} aria-current={page === currentPage ? "page" : undefined} onClick={() => paginate(page)}>{page}</button>
                  ))}
                  {firstPage + pageNumbers.length - 1 < totalPages && <span className="page-ellipsis" aria-hidden="true">…</span>}
                  <button className="page-control" disabled={currentPage === totalPages} onClick={() => paginate(currentPage + 1)} aria-label="下一頁">→</button>
                  <span className="page-summary">第 {currentPage} / {totalPages} 頁</span>
                </nav>
              )}
            </>
          ) : (
            <DataState
              empty={
                courses.length
                  ? "這個條件目前沒有課程，試試其他日期或清除篩選。"
                  : "近期沒有開放中的課程，歡迎稍後回來查看。"
              }
            />
          )}
        </>
      )}
      <div className="booking-help">
        <Icon name="calendar" />
        <p>
          還沒有堂數？先找到想上的課，再
          <Link to="/fitness-plans">選擇適合的堂數方案</Link>。
        </p>
      </div>
    </div>
  );
}
