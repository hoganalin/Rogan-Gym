import { useEffect, useState } from "react";
import { getUserCourses } from "../../api/users";
import { useCourseActions } from "../../hooks/useCourseActions";
import { formatCourseTime } from "../../lib/formatDateTime";
import type { UserCoursesResult } from "../../types/api";

export default function DashboardView() {
  const { cancelBooking } = useCourseActions();
  const [dashboard, setDashboard] = useState<UserCoursesResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getUserCourses();
      setDashboard(data);
    } catch {
      setError("載入課表失敗，請稍後再試。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleCancel(courseId: string, courseName: string) {
    const cancelled = await cancelBooking(courseId, courseName);
    if (cancelled) {
      loadDashboard();
    }
  }

  if (loading) return <p className="text-slate-500">載入中…</p>;
  if (error) return <p className="text-rose-600">{error}</p>;
  if (!dashboard) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold">我的課表</h1>
      <div className="mt-4 flex gap-6 text-sm text-slate-600">
        <p>
          剩餘堂數：<span className="font-semibold text-brand-600">{dashboard.credit_remain}</span>
        </p>
        <p>已使用：{dashboard.credit_usage} 堂</p>
      </div>

      {dashboard.course_booking.length === 0 && (
        <p className="mt-6 text-slate-500">目前沒有報名的課程。</p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {dashboard.course_booking.map((booking) => (
          <div key={booking.course_id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{booking.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {formatCourseTime(booking.start_at, booking.end_at)}・{booking.coach_name}
                </p>
                {booking.cancelled_at && (
                  <span className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                    已取消
                  </span>
                )}
              </div>
              {!booking.cancelled_at && (
                <button
                  type="button"
                  onClick={() => handleCancel(booking.course_id, booking.name)}
                  className="shrink-0 rounded border border-rose-300 px-4 py-2 text-sm text-rose-600"
                >
                  取消報名
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
