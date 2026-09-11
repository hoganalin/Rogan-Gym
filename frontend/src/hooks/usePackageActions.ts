import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postCreditPackage } from "../api/creditPackage";
import { extractErrorMessage } from "../lib/errors";

export function usePackageActions() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  async function buyPackage(packageId: string, packageName: string) {
    // AuthContext is still restoring the session from the cookie on mount —
    // treating this the same as "logged out" would spuriously redirect an
    // actually-authenticated user who clicks right after page load. (Same
    // fix applied to useCourseActions after Task 3's code review.)
    if (loading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    const result = await Swal.fire({
      title: `確定要購買「${packageName}」嗎？`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "購買",
      cancelButtonText: "取消",
      confirmButtonColor: "#d93c10",
    });
    if (!result.isConfirmed) return;

    try {
      await postCreditPackage(packageId);
      await Swal.fire({ icon: "success", title: "購買成功" });
    } catch (err) {
      await Swal.fire({ icon: "error", title: "購買失敗", text: extractErrorMessage(err) });
    }
  }

  return { buyPackage };
}
