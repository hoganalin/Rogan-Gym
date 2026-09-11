import request from "../lib/request";
import type {
  ApiSuccess,
  CreditPurchase,
  UpdatePasswordPayload,
  UserCoursesResult,
  UserProfile,
} from "../types/api";

export function getUserProfile() {
  return request.get<never, ApiSuccess<{ user: UserProfile }>>("users/profile");
}

export function putUserProfile(data: { name: string }) {
  return request.put<never, ApiSuccess<{ user: { name: string } }>>("users/profile", data);
}

export function putUserPassword(data: UpdatePasswordPayload) {
  return request.put<never, ApiSuccess<null>>("users/password", data);
}

export function getUserCourses() {
  return request.get<never, ApiSuccess<UserCoursesResult>>("users/courses");
}

export function getUserCreditPackage() {
  return request.get<never, ApiSuccess<CreditPurchase[]>>("users/credit-package");
}
