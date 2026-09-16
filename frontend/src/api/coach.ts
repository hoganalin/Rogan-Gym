import request from "../lib/request";
import type {
  ApiSuccess,
  CoachCourseDetail,
  CoachCourseListItem,
  CoachCourseMutationResult,
  CoachCoursePayload,
  CoachSelf,
  CoachSelfUpdatePayload,
  PromoteCoachPayload,
  PromoteCoachResult,
  RevenueResult,
} from "../types/api";

export function getCoachSelf() {
  return request.get<never, ApiSuccess<CoachSelf>>("coach");
}

export function putCoachSelf(data: CoachSelfUpdatePayload) {
  return request.put<never, ApiSuccess<CoachSelf>>("coach", data);
}

export function getCoachCourseList() {
  return request.get<never, ApiSuccess<CoachCourseListItem[]>>("coach/courses");
}

export function getCoachCourseDetail(courseId: string) {
  return request.get<never, ApiSuccess<CoachCourseDetail>>(`coach/courses/${courseId}`);
}

export function postCoachCourse(data: CoachCoursePayload) {
  return request.post<never, ApiSuccess<{ course: CoachCourseMutationResult }>>("coach/courses", data);
}

export function putCoachCourse(courseId: string, data: CoachCoursePayload) {
  return request.put<never, ApiSuccess<{ course: CoachCourseMutationResult }>>(`coach/courses/${courseId}`, data);
}

export function getMonthlyRevenue(month: string) {
  return request.get<never, ApiSuccess<RevenueResult>>(`coach/revenue?month=${month}`);
}

export function postPromoteUserToCoach(data: PromoteCoachPayload) {
  return request.post<never, ApiSuccess<PromoteCoachResult>>("users/me/coach", data);
}
