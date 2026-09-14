import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postCourseBooking, deleteCourseBooking } from "../api/courses";
import { getUserCourses } from "../api/users";
import { extractErrorMessage } from "../lib/errors";
import { formatCourseTime } from "../lib/formatDateTime";
import type { PublicCourse } from "../types/api";

function darkPopupHooks(popup: HTMLElement) {
  popup.style.borderRadius = "8px";
  popup.style.border = "1px solid #2a2d33";
  popup.style.boxShadow = "0 30px 70px rgba(0,0,0,.6)";
  const cancelBtn = popup.querySelector<HTMLElement>(".swal2-cancel");
  if (cancelBtn) {
    cancelBtn.style.background = "transparent";
    cancelBtn.style.border = "1px solid #2a2d33";
    cancelBtn.style.color = "#cfc9c2";
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

  async function bookCourse(course: Pick<PublicCourse, "id" | "name" | "start_at" | "end_at" | "coach_name">) {
    // AuthContext is still restoring the session from the cookie on mount —
    // treating this the same as "logged out" would spuriously redirect an
    // actually-authenticated user who clicks right after page load.
    if (loading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    const result = await Swal.fire({
      title: `確定要報名「${course.name}」嗎？`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "報名",
      cancelButtonText: "取消",
      confirmButtonColor: "#d93c10",
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
        iconColor: "#f4501e",
        title: "報名成功",
        html: `
          <div style="text-align:left">
            <p style="margin:0;font-size:14px;line-height:1.75;color:#a29d97;font-weight:300">${course.name} 已加入你的課表，開課前 24 小時可免費取消。</p>
            <div style="margin-top:20px;border:1px solid #22242a;border-radius:5px;padding:16px;display:flex;flex-direction:column;gap:10px">
              <div style="display:flex;justify-content:space-between;font-size:13px"><span style="color:#8a857f">時間</span><span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#f6f4f1">${formatCourseTime(course.start_at, course.end_at)}</span></div>
              <div style="display:flex;justify-content:space-between;font-size:13px"><span style="color:#8a857f">教練</span><span style="color:#f6f4f1">${course.coach_name}</span></div>
              <div style="display:flex;justify-content:space-between;font-size:13px"><span style="color:#8a857f">扣除堂數</span><span style="color:#f4501e;font-weight:700">1 堂 ${remainNote}</span></div>
            </div>
          </div>
        `,
        width: 440,
        background: "#121316",
        color: "#f6f4f1",
        showCancelButton: true,
        confirmButtonText: "查看我的課表",
        cancelButtonText: "繼續瀏覽",
        confirmButtonColor: "#f4501e",
        didOpen: (popup) => darkPopupHooks(popup),
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
      navigate("/login");
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
