import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types/api";

export function ProtectedRoute({ requiredRole }: { requiredRole: Role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="data-state" role="status">正在確認登入狀態…</p>;
  }

  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  if (user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
