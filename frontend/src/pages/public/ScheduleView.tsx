import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { getCoachCards } from "../../api/coachesPublic";
import { useCourseActions } from "../../hooks/useCourseActions";
import type { PublicCourse } from "../../types/api";

export default function ScheduleView() {
  const { bookCourse } = useCourseActions();
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getCoachCards(100, 1)
      .then(({ data }) => {
        if (!cancelled) setCourses(data.flatMap((coach) => coach.upcomingCourses));
      })
      .catch(() => {
        if (!cancelled) setError("載入課程時間表失敗，請稍後再試。");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const sortedCourses = useMemo(
    () => [...courses].sort((a, b) => dayjs(a.start_at).valueOf() - dayjs(b.start_at).valueOf()),
    [courses],
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div>
        <div className="font-mono text-xs tracking-[.2em] text-brand-500">COURSE SCHEDULE</div>
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight md:text-[46px]">課程時間表</h1>
        <p className="mt-3 text-[15px] font-light text-muted">依日期瀏覽可預約課程，登入後即可使用堂數報名。</p>
      </div>

      {loading && <p className="mt-12 text-center text-muted" role="status">載入中…</p>}
      {error && <p className="mt-12 text-center text-rose-400" role="alert">{error}</p>}

      {!loading && !error && (
        <div className="mt-10 overflow-x-auto rounded-md border border-line">
          <div className="min-w-[760px]">
            {sortedCourses.map((course) => (
              <div
                key={course.id}
                className="grid grid-cols-[132px_1fr_180px_150px_120px] items-center gap-5 border-b border-[#1d1f24] bg-[#0f1012] px-6 py-5 last:border-b-0"
              >
                <div>
                  <div className="font-display text-[15px] font-bold text-brand-500">{dayjs(course.start_at).format("ddd D").toUpperCase()}</div>
                  <div className="mt-1.5 font-mono text-xs text-[#8a857f]">
                    {dayjs(course.start_at).format("HH:mm")}–{dayjs(course.end_at).format("HH:mm")}
                  </div>
                </div>
                <div>
                  <h2 className="text-base font-medium">{course.name}</h2>
                  <p className="mt-1 text-xs font-light text-faint">{course.description}</p>
                </div>
                <div className="text-[13px] text-[#cfc9c2]">{course.coach_name}</div>
                <span className="w-fit rounded-[3px] border border-[#2a2d33] px-2.5 py-1 text-[11px] text-muted">{course.skill_name}</span>
                <button
                  type="button"
                  onClick={() => bookCourse(course)}
                  className="rounded-[4px] bg-brand-500 py-2.5 text-[13px] font-bold text-ink hover:bg-brand-400"
                >
                  報名
                </button>
              </div>
            ))}
            {sortedCourses.length === 0 && <p className="px-6 py-10 text-center text-muted">近期沒有開放中的課程。</p>}
          </div>
        </div>
      )}
    </div>
  );
}
