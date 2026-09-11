import { useParams } from "react-router-dom";

export default function CoachDetail() {
  const { coachId } = useParams();

  return (
    <div>
      <h1 className="text-2xl font-bold">教練詳情</h1>
      <p className="mt-2 text-slate-600">教練 ID：{coachId}</p>
    </div>
  );
}
