import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postCourseBooking } from "../api/courses";
import { extractErrorMessage } from "../lib/errors";

export function useCourseActions() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function bookCourse(courseId: string, courseName: string) {
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

  return { bookCourse };
}
