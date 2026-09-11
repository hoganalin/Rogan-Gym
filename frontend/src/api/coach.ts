import request from "../lib/request";
import type {
  ApiSuccess,
  CoachCourseDetail,
  CoachCourseListItem,
  CoachCoursePayload,
  CoachSelf,
  CoachSelfUpdatePayload,
  PromoteCoachPayload,
  PromoteCoachResult,
  RevenueResult,
} from "../types/api";

export function getCoachSelf() {
  return request.get<never, ApiSuccess<CoachSelf>>("admin/coaches");
}

export function putCoachSelf(data: CoachSelfUpdatePayload) {
  return request.put<never, ApiSuccess<CoachSelf>>("admin/coaches", data);
}

export function getCoachCourseList() {
  return request.get<never, ApiSuccess<CoachCourseListItem[]>>("admin/coaches/courses");
}

export function getCoachCourseDetail(courseId: string) {
  return request.get<never, ApiSuccess<CoachCourseDetail>>(`admin/coaches/courses/${courseId}`);
}

export function postCoachCourse(data: CoachCoursePayload) {
  return request.post<never, ApiSuccess<{ course: CoachCourseDetail }>>("admin/coaches/courses", data);
}

export function putCoachCourse(courseId: string, data: CoachCoursePayload) {
  return request.put<never, ApiSuccess<{ course: CoachCourseDetail }>>(`admin/coaches/courses/${courseId}`, data);
}

export function getMonthlyRevenue(month: string) {
  return request.get<never, ApiSuccess<RevenueResult>>(`admin/coaches/revenue?month=${month}`);
}

export function postPromoteUserToCoach(userId: string, data: PromoteCoachPayload) {
  return request.post<never, ApiSuccess<PromoteCoachResult>>(`admin/coaches/${userId}`, data);
}
