import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCoachDetail, getCoachCourses } from "../../api/coachesPublic";
import { useCourseActions } from "../../hooks/useCourseActions";
import { formatCourseTime } from "../../lib/formatDateTime";
import type { CoachDetail as CoachDetailData, PublicCourse } from "../../types/api";

export default function CoachDetail() {
  const { coachId } = useParams<{ coachId: string }>();
  const { bookCourse } = useCourseActions();
  const [detail, setDetail] = useState<CoachDetailData | null>(null);
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coachId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([getCoachDetail(coachId), getCoachCourses(coachId)])
      .then(([detailRes, coursesRes]) => {
        if (cancelled) return;
        setDetail(detailRes.data);
        setCourses(coursesRes.data);
      })
      .catch(() => {
        if (!cancelled) setError("載入教練資料失敗，請稍後再試。");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [coachId]);

  if (loading) return <p className="text-slate-500">載入中…</p>;
  if (error) return <p className="text-rose-600">{error}</p>;
  if (!detail) return null;

  return (
    <div>
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-100 font-display text-2xl font-bold text-brand-700">
          {detail.user.name.charAt(0)}
        </span>
        <div>
          <h1 className="text-2xl font-bold">{detail.user.name}</h1>
          <p className="text-sm text-slate-500">{detail.coach.experience_years} 年教學經驗</p>
        </div>
      </div>

      <p className="mt-4 text-slate-700">{detail.coach.description}</p>

      {detail.coach.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {detail.coach.skills.map((skill) => (
            <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              {skill}
            </span>
          ))}
        </div>
      )}

      <h2 className="mt-8 text-xl font-bold">開設課程</h2>
      {courses.length === 0 && <p className="mt-2 text-slate-500">目前沒有開放報名的課程。</p>}
      <div className="mt-4 flex flex-col gap-3">
        {courses.map((course) => (
          <div key={course.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{course.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {formatCourseTime(course.start_at, course.end_at)}・{course.skill_name}
                </p>
                <p className="mt-2 text-sm text-slate-600">{course.description}</p>
              </div>
              <button
                type="button"
                onClick={() => bookCourse(course.id, course.name)}
                className="shrink-0 rounded bg-brand-600 px-4 py-2 text-sm text-white"
              >
                報名
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
