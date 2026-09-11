import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCourses } from "../../api/courses";
import { getCoaches } from "../../api/coachesPublic";
import { useCourseActions } from "../../hooks/useCourseActions";
import { formatCourseTime } from "../../lib/formatDateTime";
import type { CoachListItem, PublicCourse } from "../../types/api";

export default function HomeView() {
  const { bookCourse } = useCourseActions();
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [coaches, setCoaches] = useState<CoachListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getCourses(), getCoaches(3, 1)])
      .then(([coursesRes, coachesRes]) => {
        if (cancelled) return;
        setCourses(coursesRes.data.slice(0, 6));
        setCoaches(coachesRes.data);
      })
      .catch((err) => {
        console.error("Failed to load home page data", err);
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
      <section className="text-center">
        <h1 className="font-display text-4xl font-bold">R Fitness</h1>
        <p className="mt-3 text-lg text-slate-600">找到你的教練，安排屬於你的訓練課表。</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link to="/coaches" className="rounded bg-brand-600 px-5 py-2 text-white">
            瀏覽教練
          </Link>
          <Link to="/fitness-plans" className="rounded border border-brand-600 px-5 py-2 text-brand-600">
            查看方案
          </Link>
        </div>
      </section>

      {!loading && courses.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold">近期課程</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {courses.map((course) => (
              <div key={course.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="font-semibold">{course.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {formatCourseTime(course.start_at, course.end_at)}・{course.coach_name}
                </p>
                <button
                  type="button"
                  onClick={() => bookCourse(course.id, course.name)}
                  className="mt-3 rounded bg-brand-600 px-4 py-1.5 text-sm text-white"
                >
                  報名
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && coaches.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold">熱門教練</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
        </section>
      )}
    </div>
  );
}
