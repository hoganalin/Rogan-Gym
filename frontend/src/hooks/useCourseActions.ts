import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postCourseBooking, deleteCourseBooking } from "../api/courses";
import { extractErrorMessage } from "../lib/errors";

export function useCourseActions() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  async function bookCourse(courseId: string, courseName: string) {
    // AuthContext is still restoring the session from the cookie on mount —
    // treating this the same as "logged out" would spuriously redirect an
    // actually-authenticated user who clicks right after page load.
    if (loading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    const result = await Swal.fire({
      title: `確定要報名「${courseName}」嗎？`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "報名",
      cancelButtonText: "取消",
      confirmButtonColor: "#d93c10",
    });
    if (!result.isConfirmed) return;

    try {
      await postCourseBooking(courseId);
      await Swal.fire({ icon: "success", title: "報名成功" });
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
