import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { getCoaches, getCoachCourses, getCoachDetail } from "../../api/coachesPublic";
import { getCreditPackages } from "../../api/creditPackage";
import { getSkills } from "../../api/skill";
import { useCourseActions } from "../../hooks/useCourseActions";
import { usePackageActions } from "../../hooks/usePackageActions";
import { useScrollFx } from "../../hooks/useScrollFx";
import { CoachMedia } from "../../components/CoachMedia";
import { PackageGrid } from "../../components/PackageGrid";
import type { CoachCard, CreditPackage, PublicCourse } from "../../types/api";

const FEATURED_SAMPLE_SIZE = 6;
const CARD_SCROLL_STEP = 406;

// 現有 API 沒有會員評價資料，此區文案暫時寫死（TODO：串接真實評價來源時移除）。
const TESTIMONIALS = [
  {
    quote: "以前自己練了兩年沒什麼變化，跟著課表做三個月，深蹲從 40 公斤進到 75 公斤。",
    name: "Kevin L.",
    meta: "會員 · 8 個月",
    image: "/assets/member-01.png",
  },
  {
    quote: "教練的履歷和專項寫得很清楚，我照下背問題找到教練，第一堂就把動作抓出來。",
    name: "怡萱",
    meta: "會員 · 5 個月",
    image: "/assets/member-02.png",
  },
  {
    quote: "堂數制很適合我這種要輪班的人，想上再約，取消也會退回堂數。",
    name: "阿哲",
    meta: "會員 · 1 年",
    image: "/assets/member-03.png",
  },
];

interface Stat {
  value: number;
  label: string;
  src: string;
}

export default function HomeView() {
  const { bookCourse } = useCourseActions();
  const { buyPackage } = usePackageActions();
  const [totalCoaches, setTotalCoaches] = useState(0);
  const [featured, setFeatured] = useState<CoachCard[]>([]);
  const [skillCount, setSkillCount] = useState(0);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getCoaches(100, 1)
      .then(async ({ data: list }) => {
        if (cancelled) return;
        setTotalCoaches(list.length);

        const sample = list.slice(0, FEATURED_SAMPLE_SIZE);
        const [cards, skillsRes, packagesRes] = await Promise.all([
          Promise.all(
            sample.map(async (item): Promise<CoachCard> => {
              const [{ data: detail }, { data: upcomingCourses }] = await Promise.all([
                getCoachDetail(item.id),
                getCoachCourses(item.id),
              ]);
              return {
                ...item,
                experience_years: detail.coach.experience_years,
                description: detail.coach.description,
                profile_image_url: detail.coach.profile_image_url,
                skills: detail.coach.skills,
                upcomingCourses,
              };
            }),
          ),
          getSkills(),
          getCreditPackages(),
        ]);

        if (cancelled) return;
        setFeatured(cards);
        setSkillCount(skillsRes.data.length);
        setPackages(packagesRes.data);
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

  const allUpcoming = useMemo(
    () =>
      featured
        .flatMap((c) => c.upcomingCourses)
        .sort((a, b) => dayjs(a.start_at).valueOf() - dayjs(b.start_at).valueOf()),
    [featured],
  );
  const weekCourses: PublicCourse[] = allUpcoming.slice(0, 4);
  const sortedPackages = useMemo(() => [...packages].sort((a, b) => a.price - b.price), [packages]);

  const stats: Stat[] = [
    { value: totalCoaches, label: "位認證教練", src: "GET /coaches" },
    { value: allUpcoming.length, label: "本週開放課程", src: "GET /coaches/:id/courses" },
    { value: skillCount, label: "種專項分類", src: "GET /coaches/skill" },
    { value: packages.length, label: "種堂數方案", src: "GET /credit-package" },
  ];

  // GSAP 的 ScrollTrigger.batch 只在掛載當下抓一次符合 data-rise 的節點，
  // 所以把整段內容（含所有 data-* 標記）延後到資料載入完成才 mount，
  // 確保 useScrollFx 的 useLayoutEffect 執行時卡片、方案、見證都已經在 DOM 上。
  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-muted">載入中…</div>;
  }

  return (
    <HomeContent
      stats={stats}
      featured={featured}
      weekCourses={weekCourses}
      sortedPackages={sortedPackages}
      bookCourse={bookCourse}
      buyPackage={buyPackage}
    />
  );
}

function HomeContent({
  stats,
  featured,
  weekCourses,
  sortedPackages,
  bookCourse,
  buyPackage,
}: {
  stats: Stat[];
  featured: CoachCard[];
  weekCourses: PublicCourse[];
  sortedPackages: CreditPackage[];
  bookCourse: ReturnType<typeof useCourseActions>["bookCourse"];
  buyPackage: ReturnType<typeof usePackageActions>["buyPackage"];
}) {
  const root = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useScrollFx(root);

  function scrollCarousel(dir: 1 | -1) {
    trackRef.current?.scrollBy({ left: dir * CARD_SCROLL_STEP, behavior: "smooth" });
  }

  return (
    <div ref={root}>
      {/* HERO */}
      <div data-hero="1" className="relative h-[520px] overflow-hidden bg-[#131417] md:h-[660px]">
        <img
          data-hero-img="1"
          src="/assets/hero.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "70% 45%" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #08090a 0%, #08090a 40%, rgba(8,9,10,.55) 68%, rgba(8,9,10,.15) 100%)",
          }}
        />
        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center px-6">
          <div data-reveal="1" className="font-mono text-xs tracking-[.22em] text-brand-500">
            ONLINE COACHING PLATFORM
          </div>
          <h1
            data-reveal="2"
            className="mt-5 max-w-[760px] font-display text-5xl font-black leading-[.98] tracking-tight sm:text-6xl md:text-[82px]"
          >
            TRAIN WITH
            <br />
            A REAL COACH.
          </h1>
          <p data-reveal="3" className="mt-5 max-w-[480px] text-lg leading-relaxed font-light text-[#cfc9c2]">
            找到你的教練，安排屬於你的訓練課表。看得到履歷、看得到時段，線上報名直接扣堂。
          </p>
          <div data-reveal="4" className="mt-9 flex flex-wrap gap-3.5">
            <Link
              to="/coaches"
              className="rounded-[4px] bg-brand-500 px-[30px] py-4 text-[15px] font-bold text-ink hover:bg-brand-400"
            >
              瀏覽教練
            </Link>
            <Link
              to="/fitness-plans"
              className="rounded-[4px] border border-[#3a3d44] px-[30px] py-4 text-[15px] font-medium hover:border-brand-400"
            >
              查看方案
            </Link>
          </div>
        </div>
      </div>

      {/* STAT STRIP */}
      <div className="border-y border-[#1d1f24] bg-[#0a0b0c]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 px-6 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} data-rise="1" className="border-l border-[#1d1f24] py-8 pl-7 first:border-l-0">
              <div data-count="1" className="font-display text-4xl font-extrabold tracking-tight">
                {s.value}
              </div>
              <div className="mt-2.5 text-[13px] text-[#8a857f]">{s.label}</div>
              <div className="mt-1 font-mono text-[10px] text-[#4f4a45]">{s.src}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED COACHES */}
      <div className="mx-auto max-w-6xl px-6 pt-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="font-mono text-xs tracking-[.2em] text-brand-500">FEATURED COACHES</div>
            <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight md:text-[46px]">精選教練</h2>
            <p className="mt-3 text-[15px] font-light text-muted">年資、專項與開課時段，全部來自教練自己維護的檔案。</p>
          </div>
          <div className="flex shrink-0 gap-2.5">
            <button
              type="button"
              onClick={() => scrollCarousel(-1)}
              aria-label="上一位"
              className="h-[46px] w-[46px] rounded-[4px] border border-[#2f3238] text-lg hover:border-brand-500 hover:text-brand-500"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel(1)}
              aria-label="下一位"
              className="h-[46px] w-[46px] rounded-[4px] border border-[#2f3238] text-lg hover:border-brand-500 hover:text-brand-500"
            >
              →
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="mt-9 flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {featured.map((coach) => (
            <Link
              key={coach.id}
              to={`/coaches/${coach.id}`}
              data-rise="1"
              className="block shrink-0 basis-[386px] overflow-hidden rounded-md border border-line bg-surface hover:border-[#4a3b33]"
            >
              <div className="relative h-[300px] bg-[#16181b]">
                <CoachMedia src={coach.profile_image_url} name={coach.name} className="h-full w-full" />
                <span className="absolute top-3.5 right-3.5 rounded-[3px] border border-[#2f3238] bg-ink/70 px-2.5 py-1.5 font-mono text-[11px] text-brand-500">
                  {coach.experience_years}Y
                </span>
              </div>
              <div className="p-5 pb-6">
                <div className="text-xl font-bold">{coach.name}</div>
                <p className="mt-2.5 line-clamp-2 text-[13px] leading-relaxed font-light text-[#8a857f]">
                  {coach.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {coach.skills.slice(0, 3).map((sk) => (
                    <span key={sk} className="rounded-[3px] border border-[#2a2d33] px-2.5 py-1 text-[11px] text-[#cfc9c2]">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
          {featured.length === 0 && <p className="text-muted">目前沒有教練資料。</p>}
        </div>
      </div>

      {/* WEEK COURSES */}
      <div className="mx-auto max-w-6xl px-6 pt-24">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-[34px] font-extrabold tracking-tight">本週課程</h2>
          <Link to="/coaches" className="text-[13px] font-medium text-brand-500 hover:text-brand-400">
            完整時間表 →
          </Link>
        </div>
        <div className="mt-7 overflow-x-auto rounded-md border border-line">
          <div className="min-w-[760px]">
            {weekCourses.map((course) => (
              <div
                key={course.id}
                data-rise="1"
                className="grid grid-cols-[130px_1fr_180px_150px_120px] items-center gap-5 border-b border-[#1d1f24] bg-[#0f1012] px-6 py-5 last:border-b-0"
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
                <div className="text-[13px] text-[#cfc9c2]">{course.coach_name}</div>
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
            {weekCourses.length === 0 && (
              <div className="px-6 py-10 text-center text-muted">近期沒有開放中的課程。</div>
            )}
          </div>
        </div>
      </div>

      {/* PACKAGES */}
      <div className="mt-24 border-y border-[#1d1f24] bg-[#0a0b0c]">
        <div className="mx-auto max-w-6xl px-6 py-22">
          <div className="text-center">
            <div className="font-mono text-xs tracking-[.2em] text-brand-500">CREDIT PACKAGES</div>
            <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight md:text-[46px]">健身方案</h2>
            <p className="mt-3 text-[15px] font-light text-muted">買堂數，報名任一位教練的課程。每堂均價由方案價格與堂數換算。</p>
          </div>
          <div className="mt-12">
            <PackageGrid packages={sortedPackages} onBuy={buyPackage} scrollFx />
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="mx-auto max-w-6xl px-6 pt-22 pb-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="font-mono text-xs tracking-[.2em] text-brand-500">MEMBER RESULTS</div>
            <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight md:text-[46px]">會員成果見證</h2>
          </div>
        </div>
        <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} data-rise="1" className="flex flex-col gap-5 rounded-md border border-line bg-surface p-[30px]">
              <div className="font-display text-[34px] font-extrabold text-brand-500">&ldquo;</div>
              <p className="text-[15px] leading-loose font-light text-[#cfc9c2]">{t.quote}</p>
              <div className="mt-auto flex items-center gap-3.5 pt-2">
                <img
                  src={t.image}
                  alt=""
                  className="h-11 w-11 shrink-0 rounded-full border border-[#2a2d33] object-cover"
                />
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-faint">{t.meta}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
