import { useState, type FormEvent } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { postPromoteUserToCoach } from "../../api/coach";
import { extractErrorMessage } from "../../lib/errors";

export default function BecomeCoachView() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [experienceYears, setExperienceYears] = useState("");
  const [description, setDescription] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      await postPromoteUserToCoach(user.id, {
        experience_years: Number(experienceYears),
        description,
        ...(profileImageUrl ? { profile_image_url: profileImageUrl } : {}),
      });
      await Swal.fire({
        icon: "success",
        title: "升級成功！",
        text: "請重新登入以啟用教練功能。",
      });
      logout();
      navigate("/login");
    } catch (err) {
      await Swal.fire({ icon: "error", title: "升級失敗", text: extractErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">成為教練</h1>
      <p className="mt-2 text-slate-600">填寫經歷與自我介紹，升級為 R Fitness 教練。</p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-sm">
        <label className="block text-sm">
          教學經驗（年）
          <input
            type="number"
            min={0}
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
          />
        </label>
        <label className="mt-3 block text-sm">
          自我介紹
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            rows={4}
            required
          />
        </label>
        <label className="mt-3 block text-sm">
          個人照片網址（選填，需以 https 開頭）
          <input
            type="url"
            value={profileImageUrl}
            onChange={(e) => setProfileImageUrl(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            placeholder="https://"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 rounded bg-brand-600 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          送出申請
        </button>
      </form>
    </div>
  );
}
