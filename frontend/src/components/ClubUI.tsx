import { Link } from "react-router-dom";
import dayjs from "dayjs";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { CoachCard, PublicCourse } from "../types/api";
import { CoachMedia } from "./CoachMedia";

export function Icon({
  name = "arrow",
  size = 20,
}: {
  name?: "arrow" | "search" | "calendar" | "menu" | "close" | "check";
  size?: number;
}) {
  const paths = {
    arrow: "M4 12h16m-6-6 6 6-6 6",
    search: "m16 16 5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
    calendar: "M5 5h14v16H5zM8 2v6m8-6v6M5 11h14",
    menu: "M4 6h16M4 12h16M4 18h16",
    close: "m5 5 14 14M5 19 19 5",
    check: "m4 12 5 5L20 6",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
export function Brand() {
  return <Link to="/" className="club-brand" aria-label="R Fitness 首頁">R FITNESS<span className="brand-period" aria-hidden="true">/</span></Link>;
}
export function PageHeading({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{children}</p>
      </div>
      {action}
    </header>
  );
}
export function DataState({
  loading,
  error,
  empty,
  onRetry,
}: {
  loading?: boolean;
  error?: string | null;
  empty?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className={`data-state ${loading ? "is-loading" : ""}`}
      role={error ? "alert" : "status"}
      aria-live="polite"
    >
      <p>{loading ? "正在準備你的訓練選擇…" : error || empty}</p>
      {error && onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          重新載入
        </button>
      )}
    </div>
  );
}
/** Title block for member and coach task pages; `action` sits beside the title. */
export function WorkspaceHeading({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="workspace-heading">
      <div>
        <h1>{title}</h1>
        {children && <p>{children}</p>}
      </div>
      {action}
    </header>
  );
}
/** Labelled form control. Pass the native input / select / textarea as children. */
export function Field({
  label,
  mono = false,
  className = "",
  children,
}: {
  label: string;
  mono?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`field ${mono ? "field-mono" : ""} ${className}`}>
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}
/** Workspace button: 2px control radius, primary / secondary / danger. */
export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  size?: "md" | "sm";
}) {
  return (
    <button
      type={type}
      className={`btn btn-compact btn-${variant} ${size === "sm" ? "btn-sm" : ""} ${className}`}
      {...props}
    />
  );
}
/** Inline loading or error line for workspace pages. */
export function StatusText({
  error = false,
  className = "",
  children,
}: {
  error?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <p
      className={`status-text ${error ? "is-error" : ""} ${className}`}
      role={error ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
export function CoachTile({ coach }: { coach: CoachCard }) {
  return (
    <Link className="coach-tile" to={`/coaches/${coach.id}`}>
      <div className="coach-photo">
        <CoachMedia
          src={coach.profile_image_url}
          name={coach.name}
          className="h-full w-full"
        />
        <span className="experience-label">
          {coach.experience_years} 年教學經驗
        </span>
      </div>
      <div className="coach-info">
        <div className="coach-name">
          <h3>{coach.name}</h3>
          <Icon />
        </div>
        <div className="tag-list">
          {coach.skills.slice(0, 3).map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
        <p>{coach.description || "查看教練檔案，了解訓練專長與開課時間。"}</p>
        <span className="coach-availability">
          {coach.upcomingCourses.length > 0
            ? `${coach.upcomingCourses.length} 堂開放課程 · 查看課表`
            : "查看教練檔案"}
        </span>
      </div>
    </Link>
  );
}
export function CourseList({
  courses,
  onBook,
}: {
  courses: PublicCourse[];
  onBook: (course: PublicCourse) => void;
}) {
  return (
    <div className="course-list">
      {courses.map((course) => (
        <article className="course-row" key={course.id}>
          <div className="course-date">
            <strong>{dayjs(course.start_at).format("MM.DD")}</strong>
            <span>
              {
                ["週日", "週一", "週二", "週三", "週四", "週五", "週六"][
                  dayjs(course.start_at).day()
                ]
              }
            </span>
          </div>
          <div className="course-description">
            <span className="course-time">
              {dayjs(course.start_at).format("HH:mm")}–
              {dayjs(course.end_at).format("HH:mm")}
            </span>
            <h3>{course.name}</h3>
            <p>{course.description}</p>
          </div>
          <div className="course-person">
            <strong>{course.coach_name}</strong>
            <span>{course.skill_name}</span>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => onBook(course)}
            aria-label={`報名 ${course.name}`}
          >
            報名 <Icon />
          </button>
        </article>
      ))}
    </div>
  );
}
