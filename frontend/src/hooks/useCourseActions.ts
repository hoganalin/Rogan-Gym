import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postCourseBooking, deleteCourseBooking } from "../api/courses";
import { getUserCourses } from "../api/users";
import { extractErrorMessage } from "../lib/errors";
import { formatCourseTime } from "../lib/formatDateTime";
import type { PublicCourse } from "../types/api";

function popupHooks(popup: HTMLElement) {
  popup.style.borderRadius = "8px";
  popup.style.border = "1px solid var(--color-line)";
  popup.style.boxShadow = "0 30px 70px rgba(17,45,35,.16)";
  const cancelBtn = popup.querySelector<HTMLElement>(".swal2-cancel");
  if (cancelBtn) {
    cancelBtn.style.background = "transparent";
    cancelBtn.style.border = "1px solid var(--color-line)";
    cancelBtn.style.color = "var(--color-body)";
    cancelBtn.style.boxShadow = "none";
  }
  const confirmBtn = popup.querySelector<HTMLElement>(".swal2-confirm");
  if (confirmBtn) {
    confirmBtn.style.boxShadow = "none";
    confirmBtn.style.fontWeight = "700";
  }
}

export function useCourseActions() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function bookCourse(course: Pick<PublicCourse, "id" | "name" | "start_at" | "end_at" | "coach_name">) {
    // AuthContext is still restoring the session from the cookie on mount —
    // treating this the same as "logged out" would spuriously redirect an
    // actually-authenticated user who clicks right after page load.
    if (loading) return;

    if (!user) {
      navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }

    const result = await Swal.fire({
      title: `確定要報名「${course.name}」嗎？`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "報名",
      cancelButtonText: "取消",
      confirmButtonColor: "var(--color-brand-600)",
    });
    if (!result.isConfirmed) return;

    try {
      await postCourseBooking(course.id);

      let remainNote = "";
      try {
        const { data } = await getUserCourses();
        remainNote = `（剩餘 ${data.credit_remain}）`;
      } catch {
        // 剩餘堂數僅供彈窗顯示參考，取得失敗不影響報名結果。
      }

      const successResult = await Swal.fire({
        icon: "success",
        iconColor: "var(--color-brand-500)",
        title: "報名成功",
        text: `${course.name} 已加入你的課表。時間：${formatCourseTime(course.start_at, course.end_at)}。教練：${course.coach_name}。使用 1 堂 ${remainNote}。`,
        width: 440,
        background: "var(--color-surface)",
        color: "var(--color-body)",
        showCancelButton: true,
        confirmButtonText: "查看我的課表",
        cancelButtonText: "繼續瀏覽",
        confirmButtonColor: "var(--color-brand-500)",
        didOpen: (popup) => popupHooks(popup),
      });
      if (successResult.isConfirmed) {
        navigate("/user/dashboard");
      }
    } catch (err) {
      await Swal.fire({ icon: "error", title: "報名失敗", text: extractErrorMessage(err) });
    }
  }

  async function cancelBooking(courseId: string, courseName: string): Promise<boolean> {
    if (loading) return false;

    if (!user) {
      navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
      return false;
    }

    const result = await Swal.fire({
      title: `確定要取消報名「${courseName}」嗎？`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "取消報名",
      cancelButtonText: "再想想",
      confirmButtonColor: "#e11d48",
    });
    if (!result.isConfirmed) return false;

    try {
      await deleteCourseBooking(courseId);
      await Swal.fire({ icon: "success", title: "已取消報名" });
      return true;
    } catch (err) {
      await Swal.fire({ icon: "error", title: "取消失敗", text: extractErrorMessage(err) });
      return false;
    }
  }

  return { bookCourse, cancelBooking };
}
