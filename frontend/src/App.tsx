import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RootLayout } from "./components/RootLayout";
import { UserLayout } from "./layouts/UserLayout";
import { CoachLayout } from "./layouts/CoachLayout";
import NotFound from "./pages/NotFound";
import HomeView from "./pages/public/HomeView";
import CoachesView from "./pages/public/CoachesView";
import CoachDetail from "./pages/public/CoachDetail";
import FitnessPlans from "./pages/public/FitnessPlans";
import LoginView from "./pages/public/auth/LoginView";
import SignupView from "./pages/public/auth/SignupView";
import UserDashboardView from "./pages/user/DashboardView";
import UserProfileView from "./pages/user/ProfileView";
import OrdersView from "./pages/user/OrdersView";
import BecomeCoachView from "./pages/user/BecomeCoachView";
import CoachProfileView from "./pages/coach/ProfileView";
import CoachCoursesView from "./pages/coach/CoursesView";
import EarningsView from "./pages/coach/EarningsView";
import SkillTagsView from "./pages/coach/SkillTagsView";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* 登入／註冊沿用設計稿的獨立分割版面，不套 RootLayout 的導覽列與頁尾。 */}
          <Route path="login" element={<LoginView />} />
          <Route path="signup" element={<SignupView />} />

          <Route element={<RootLayout />}>
            <Route index element={<HomeView />} />
            <Route path="coaches" element={<CoachesView />} />
            <Route path="coaches/:coachId" element={<CoachDetail />} />
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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
