import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCoachDetail, getCoachCourses } from "../../api/coachesPublic";
import { useCourseActions } from "../../hooks/useCourseActions";
import { CoachMedia } from "../../components/CoachMedia";
import { CourseList, DataState, Icon } from "../../components/ClubUI";
import type {
  CoachDetail as CoachDetailData,
  PublicCourse,
} from "../../types/api";
export default function CoachDetail() {
  const { coachId } = useParams<{ coachId: string }>();
  const { bookCourse } = useCourseActions();
  const [detail, setDetail] = useState<CoachDetailData | null>(null);
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!coachId) return;
    let live = true;
    setLoading(true);
    setError(null);
    Promise.all([getCoachDetail(coachId), getCoachCourses(coachId)])
      .then(([d, c]) => {
        if (live) {
          setDetail(d.data);
          setCourses(
            [...c.data].sort(
              (a, b) => Date.parse(a.start_at) - Date.parse(b.start_at),
            ),
          );
        }
      })
      .catch(() => {
        if (live) setError("載入教練資料失敗，請重新試一次。");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [coachId, attempt]);
  return (
    <div className="club-container page-space">
      <Link className="back-link" to="/coaches">
        返回教練列表
      </Link>
      {loading || error ? (
        <DataState
          loading={loading}
          error={error}
          onRetry={() => setAttempt((a) => a + 1)}
        />
      ) : (
        detail && (
          <>
            <section className="coach-profile">
              <div className="profile-photo">
                <CoachMedia
                  src={detail.coach.profile_image_url}
                  name={detail.user.name}
                  className="w-full h-full"
                />
              </div>
              <div className="profile-copy">
                <h1>{detail.user.name}</h1>
                <span className="profile-experience">
                  {detail.coach.experience_years} 年教學經驗
                </span>
                <div className="tag-list">
                  {detail.coach.skills.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
                <p>{detail.coach.description}</p>
                <a className="btn btn-primary" href="#coach-courses">
                  查看開課時間
                  <Icon />
                </a>
              </div>
            </section>
            <section id="coach-courses" className="section-space">
              <div className="section-heading">
                <div>
                  <h2>與 {detail.user.name} 一起訓練</h2>
                  <p>確認時間與課程內容，再使用堂數完成報名。</p>
                </div>
                <span>{courses.length} 堂開放課程</span>
              </div>
              {courses.length ? (
                <CourseList courses={courses} onBook={bookCourse} />
              ) : (
                <DataState empty="目前沒有開放報名的課程，歡迎稍後再來看看。" />
              )}
            </section>
          </>
        )
      )}
    </div>
  );
}
