import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import { getCoachDetail, getCoachCourses } from "../../api/coachesPublic";
import { useCourseActions } from "../../hooks/useCourseActions";
import { CoachMedia } from "../../components/CoachMedia";
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

  if (loading) return <div className="mx-auto max-w-6xl px-6 py-24 text-center text-muted">載入中…</div>;
  if (error) return <div className="mx-auto max-w-6xl px-6 py-24 text-center text-rose-400">{error}</div>;
  if (!detail) return null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="overflow-hidden rounded-md border border-line bg-surface">
        <div className="relative h-[320px] bg-[#16181b]">
          <CoachMedia src={detail.coach.profile_image_url} name={detail.user.name} className="h-full w-full" />
          <span className="absolute top-4 right-4 rounded-[3px] border border-[#2f3238] bg-ink/70 px-2.5 py-1.5 font-mono text-[11px] text-brand-500">
            {detail.coach.experience_years}Y
          </span>
        </div>
        <div className="p-8">
          <div className="font-display text-3xl font-extrabold tracking-tight">{detail.user.name}</div>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed font-light text-[#8a857f]">
            {detail.coach.description}
          </p>
          {detail.coach.skills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {detail.coach.skills.map((skill) => (
                <span key={skill} className="rounded-[3px] border border-[#2a2d33] px-2.5 py-1 text-[11px] text-[#cfc9c2]">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <h2 className="mt-14 font-display text-[28px] font-extrabold tracking-tight">開設課程</h2>
      {courses.length === 0 && <p className="mt-3 text-muted">目前沒有開放報名的課程。</p>}

      <div className="mt-6 overflow-x-auto rounded-md border border-line">
        <div className="min-w-[640px]">
          {courses.map((course) => (
            <div
              key={course.id}
              className="grid grid-cols-[130px_1fr_150px_120px] items-center gap-5 border-b border-[#1d1f24] bg-[#0f1012] px-6 py-5 last:border-b-0"
            >
              <div>
                <div className="font-display text-[15px] font-bold text-brand-500">
                  {dayjs(course.start_at).format("ddd D").toUpperCase()}
                </div>
                <div className="mt-1.5 font-mono text-xs text-[#8a857f]">
                  {dayjs(course.start_at).format("HH:mm")}–{dayjs(course.end_at).format("HH:mm")}
                </div>
              </div>
              <div>
                <h3 className="text-base font-medium">{course.name}</h3>
                <div className="mt-1 text-xs font-light text-faint">{course.description}</div>
              </div>
              <div>
                <span className="rounded-[3px] border border-[#2a2d33] px-2.5 py-1 text-[11px] text-muted">
                  {course.skill_name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => bookCourse(course)}
                className="rounded-[4px] bg-brand-500 py-2.5 text-[13px] font-bold text-ink hover:bg-brand-400"
              >
                報名
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
