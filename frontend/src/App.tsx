import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RootLayout } from "./components/RootLayout";
import { UserLayout } from "./layouts/UserLayout";
import { CoachLayout } from "./layouts/CoachLayout";
import HomeView from "./pages/public/HomeView";

const NotFound = lazy(() => import("./pages/NotFound"));
const CoachesView = lazy(() => import("./pages/public/CoachesView"));
const CoachDetail = lazy(() => import("./pages/public/CoachDetail"));
const FitnessPlans = lazy(() => import("./pages/public/FitnessPlans"));
const ScheduleView = lazy(() => import("./pages/public/ScheduleView"));
const LoginView = lazy(() => import("./pages/public/auth/LoginView"));
const SignupView = lazy(() => import("./pages/public/auth/SignupView"));
const UserDashboardView = lazy(() => import("./pages/user/DashboardView"));
const UserProfileView = lazy(() => import("./pages/user/ProfileView"));
const OrdersView = lazy(() => import("./pages/user/OrdersView"));
const BecomeCoachView = lazy(() => import("./pages/user/BecomeCoachView"));
const CoachProfileView = lazy(() => import("./pages/coach/ProfileView"));
const CoachCoursesView = lazy(() => import("./pages/coach/CoursesView"));
const EarningsView = lazy(() => import("./pages/coach/EarningsView"));
const SkillTagsView = lazy(() => import("./pages/coach/SkillTagsView"));

function PageBoundary() {
  return (
    <Suspense fallback={<div className="club-container py-16 min-h-[40vh]" role="status" aria-live="polite">正在載入頁面…</div>}>
      <Outlet />
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* 登入／註冊沿用設計稿的獨立分割版面，不套 RootLayout 的導覽列與頁尾。 */}
          <Route element={<PageBoundary />}>
            <Route path="login" element={<LoginView />} />
            <Route path="signup" element={<SignupView />} />
          </Route>

          <Route element={<RootLayout />}>
            <Route element={<PageBoundary />}>
              <Route index element={<HomeView />} />
              <Route path="coaches" element={<CoachesView />} />
              <Route path="coaches/:coachId" element={<CoachDetail />} />
              <Route path="schedule" element={<ScheduleView />} />
              <Route path="fitness-plans" element={<FitnessPlans />} />

              <Route path="user" element={<ProtectedRoute requiredRole="USER" />}>
                <Route element={<UserLayout />}>
                  <Route index element={<UserDashboardView />} />
                  <Route path="dashboard" element={<UserDashboardView />} />
                  <Route path="profile" element={<UserProfileView />} />
                  <Route path="orders" element={<OrdersView />} />
                  <Route path="become-coach" element={<BecomeCoachView />} />
                </Route>
              </Route>

              <Route path="coach" element={<ProtectedRoute requiredRole="COACH" />}>
                <Route element={<CoachLayout />}>
                  <Route index element={<CoachProfileView />} />
                  <Route path="profile" element={<CoachProfileView />} />
                  <Route path="courses" element={<CoachCoursesView />} />
                  <Route path="earnings" element={<EarningsView />} />
                  <Route path="skills" element={<SkillTagsView />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
