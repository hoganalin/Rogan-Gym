export interface ApiSuccess<T> {
  status: "success";
  data: T;
}

export interface ApiErrorBody {
  status: "failed" | "error";
  message: string;
}

export type Role = "USER" | "COACH";

export interface AuthUser {
  name: string;
  role: Role;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface SignupResult {
  user: { id: string; name: string; email: string };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: { name: string };
}

export interface UserProfile {
  name: string;
  email: string;
}

export interface UpdatePasswordPayload {
  password: string;
  new_password: string;
  confirm_new_password: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  price: number;
  credit_amount: number;
}

export interface CreditPurchase {
  name?: string;
  purchased_credits: number;
  price_paid: number;
  purchase_at: string;
}

export interface UserCourseBooking {
  course_id: string;
  name: string;
  start_at: string;
  end_at: string;
  meeting_url: string;
  coach_name: string;
  cancelled_at: string | null;
}

export interface UserCoursesResult {
  credit_remain: number;
  credit_usage: number;
  course_booking: UserCourseBooking[];
}

export interface CoachListItem {
  id: string;
  user_id: string;
  name: string;
}

export interface CoachDetail {
  user: { name: string; role: Role };
  coach: {
    id: string;
    user_id: string;
    experience_years: number;
    description: string;
    profile_image_url: string | null;
    created_at: string;
    updated_at: string;
    skills: string[];
  };
}

export interface PublicCourse {
  id: string;
  name: string;
  description: string;
  start_at: string;
  end_at: string;
  max_participants: number;
  coach_name: string;
  skill_name: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface CoachSelf {
  id: string;
  experience_years: number;
  description: string;
  profile_image_url: string | null;
  skill_ids: string[];
}

export interface CoachSelfUpdatePayload {
  skill_ids: string[];
  experience_years: number;
  description: string;
  profile_image_url: string;
}

export type CourseStatus = "尚未開始" | "進行中" | "已結束";

export interface CoachCourseListItem {
  id: string;
  name: string;
  status: CourseStatus;
  start_at: string;
  end_at: string;
  max_participants: number;
  meeting_url: string;
  participants: number;
}

export interface CoachCourseDetail {
  id: string;
  skill_name: string;
  skill_id: string;
  name: string;
  description: string;
  start_at: string;
  end_at: string;
  max_participants: number;
  meeting_url: string;
}

export interface CoachCoursePayload {
  skill_id: string;
  name: string;
  description: string;
  start_at: string;
  end_at: string;
  max_participants: number;
  meeting_url: string;
}

export interface RevenueResult {
  total: {
    revenue: number;
    participants: number;
    course_count: number;
  };
}

export interface PromoteCoachPayload {
  experience_years: number;
  description: string;
  profile_image_url?: string;
}

export interface PromoteCoachResult {
  user: { name: string; role: Role };
  coach: {
    id: string;
    user_id: string;
    experience_years: number;
    description: string;
    profile_image_url: string | null;
    created_at: string;
    updated_at: string;
  };
}
