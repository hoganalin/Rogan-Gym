import { useState, type FormEvent } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { postPromoteUserToCoach } from "../../api/coach";
import { extractErrorMessage } from "../../lib/errors";
import { Button, Field, WorkspaceHeading } from "../../components/ClubUI";

const STEPS = [
  { n: 1, label: "填寫經歷" },
  { n: 2, label: "設定技能標籤" },
  { n: 3, label: "重新登入啟用" },
];

export default function BecomeCoachView() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [experienceYears, setExperienceYears] = useState("");
  const [description, setDescription] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      await postPromoteUserToCoach({
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
      <WorkspaceHeading title="成為教練">
        填寫經歷與自我介紹，升級為 R Fitness 教練。送出後需重新登入以啟用教練權限。
      </WorkspaceHeading>

      <div className="mt-7 flex items-center gap-2.5">
        {STEPS.map((step, i) => (
          <div key={step.n} className="flex items-center gap-2.5">
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-[26px] w-[26px] items-center justify-center rounded-full border font-mono text-xs font-bold ${
                  i === 0 ? "border-brand-500 bg-brand-500 text-on-brand" : "border-line text-faint"
                }`}
              >
                {step.n}
              </span>
              <span className={`text-[13px] ${i === 0 ? "text-body" : "text-faint"}`}>{step.label}</span>
            </div>
            {i < STEPS.length - 1 && <span className="h-px w-7 bg-line" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex max-w-[520px] flex-col gap-4.5">
        <Field label="教學經驗（年）">
          <input
            type="number"
            min={0}
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            placeholder="6"
            required
          />
        </Field>
        <Field label="自我介紹">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="專注肌力訓練與體態調整…"
            rows={4}
            required
          />
        </Field>
        <Field label="個人照片網址（選填，需 https）" mono>
          <input
            type="url"
            value={profileImageUrl}
            onChange={(e) => setProfileImageUrl(e.target.value)}
            placeholder="https://"
          />
        </Field>
        <Button type="submit" disabled={submitting} className="mt-2 w-fit">
          送出申請
        </Button>
      </form>
    </div>
  );
}
