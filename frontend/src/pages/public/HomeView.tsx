import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCoachCards } from "../../api/coachesPublic";
import { getCreditPackages } from "../../api/creditPackage";
import { useCourseActions } from "../../hooks/useCourseActions";
import { usePackageActions } from "../../hooks/usePackageActions";
import { PackageGrid } from "../../components/PackageGrid";
import {
  CoachTile,
  CourseList,
  DataState,
  Icon,
} from "../../components/ClubUI";
import type { CoachCard, CreditPackage } from "../../types/api";
export default function HomeView() {
  const [coaches, setCoaches] = useState<CoachCard[]>([]);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [packageLoading, setPackageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [packageError, setPackageError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");
  const navigate = useNavigate();
  const { bookCourse } = useCourseActions();
  const { buyPackage } = usePackageActions();
  useEffect(() => {
    let live = true;
    setLoading(true);
    setPackageLoading(true);
    setError(null);
    setPackageError(null);
    getCoachCards(6, 1)
      .then(({ data }) => {
        if (live) setCoaches(data);
      })
      .catch(() => {
        if (live) setError("暫時無法載入教練與課程，請重新試一次。");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    getCreditPackages()
      .then(({ data }) => {
        if (live) setPackages(data);
      })
      .catch(() => {
        if (live) setPackageError("暫時無法載入堂數方案。");
      })
      .finally(() => {
        if (live) setPackageLoading(false);
      });
    return () => {
      live = false;
    };
  }, [attempt]);
  const courses = coaches
    .flatMap((c) => c.upcomingCourses)
    .sort((a, b) => Date.parse(a.start_at) - Date.parse(b.start_at))
    .slice(0, 3);
  function search(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (date) params.set("date", date);
    navigate("/schedule" + (params.size ? "?" + params.toString() : ""));
  }
  return (
    <>
      <section className="editorial-hero">
        <img className="editorial-hero-image" src="/assets/editorial/runner.webp" alt="藍衣跑者在陽光下的跑道上向前奔跑" fetchPriority="high" />
        <div className="editorial-hero-panel"><div className="editorial-hero-copy">
          <p className="hero-display" aria-hidden="true">MOVE ON<br />YOUR TERMS.</p>
          <h1>找到你的節奏。</h1><p className="hero-description">找教練、選課程，把運動排進生活。</p>
          <div className="hero-actions"><Link className="btn btn-yellow" to="/coaches">探索教練<Icon /></Link><Link className="btn btn-outline-white" to="/schedule">查看課表</Link></div>
          <p className="hero-signoff">FIT PEOPLE. STRONGER LIVES.</p>
        </div></div>
      </section>
      <form className="booking-strip" onSubmit={search}>
        <label><Icon name="search" /><span>訓練專項<input aria-label="搜尋教練或訓練專項" placeholder="輸入課程、教練或專項" value={query} onChange={e => setQuery(e.target.value)} /></span></label>
        <label><Icon name="calendar" /><span>開課日期<input aria-label="選擇開課日期" type="date" value={date} onChange={e => setDate(e.target.value)} /></span></label>
        <button type="submit" className="btn btn-primary">尋找課程<Icon /></button>
      </form>
      <section className="training-editorial club-container">
        <div className="section-heading"><h2>每一種目標，都有你的練法。</h2><Link className="text-link" to="/coaches">探索所有教練<Icon /></Link></div>
        <div className="training-grid">
          <Link className="training-type" to="/coaches"><strong>STRENGTH<br />STARTS HERE.</strong><span>找到你的訓練夥伴<Icon /></span></Link>
          <Link className="training-photo" to="/schedule"><img src="/assets/editorial/strength.webp" alt="在明亮訓練場地手握啞鈴" loading="lazy" /><span><strong>建立力量</strong><span>從一堂課開始<Icon /></span></span></Link>
          <Link className="training-photo" to="/schedule"><img src="/assets/editorial/balance.webp" alt="在藍色墊子上練習伸展" loading="lazy" /><span><strong>找回平衡</strong><span>留時間給自己<Icon /></span></span></Link>
        </div>
      </section>
      <section className="club-container section-space">
        <div className="section-heading">
          <div>
            <h2>你的目標，交給專業。</h2>
            <p>了解專長、認識風格，找到一起前進的訓練夥伴。</p>
          </div>
          <Link className="text-link" to="/coaches">
            探索所有教練
            <Icon />
          </Link>
        </div>
        {loading || error ? (
          <DataState
            loading={loading}
            error={error}
            onRetry={() => setAttempt((a) => a + 1)}
          />
        ) : coaches.length ? (
          <div className="coach-grid">
            {coaches.slice(0, 3).map((c) => (
              <CoachTile key={c.id} coach={c} />
            ))}
          </div>
        ) : (
          <DataState empty="教練資料準備中，稍後再來看看。" />
        )}
      </section>
      <section className="schedule-section">
        <div className="club-container">
          <div className="section-heading">
            <div>
              <h2>YOUR NEXT SESSION.</h2>
              <p>近期開放課程。找到合適的時間，開始累積每一次進步。</p>
            </div>
            <Link className="text-link" to="/schedule">
              完整課程時間表
              <Icon />
            </Link>
          </div>
          {loading || error ? (
            <DataState
              loading={loading}
              error={error}
              onRetry={() => setAttempt((a) => a + 1)}
            />
          ) : courses.length ? (
            <CourseList courses={courses} onBook={bookCourse} />
          ) : (
            <DataState empty="近期沒有開放中的課程，歡迎稍後回來查看。" />
          )}
        </div>
      </section>
      <section className="club-container section-space">
        <div className="section-heading">
          <div>
            <h2>TRAIN MORE. YOUR WAY.</h2>
            <p>先選堂數，再安排訓練。所有方案皆可報名平台上的教練課程。</p>
          </div>
          <Link className="text-link" to="/fitness-plans">
            比較堂數方案
            <Icon />
          </Link>
        </div>
        {packageLoading || packageError ? (
          <DataState
            loading={packageLoading}
            error={packageError}
            onRetry={() => setAttempt((a) => a + 1)}
          />
        ) : (
          <PackageGrid packages={packages} onBuy={buyPackage} />
        )}
      </section>
      <section className="club-container closing-note">
        <h2>
          不必等到準備好，
          <br />
          先為自己開始。
        </h2>
        <Link className="btn btn-primary" to="/coaches">
          找到我的教練
          <Icon />
        </Link>
      </section>
    </>
  );
}
