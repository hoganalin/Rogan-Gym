import request from "../lib/request";
import type { ApiSuccess, CoachDetail, CoachListItem, PublicCourse } from "../types/api";

export function getCoaches(per: number, page: number) {
  return request.get<never, ApiSuccess<CoachListItem[]>>(`coaches/?per=${per}&page=${page}`);
}

export function getCoachDetail(coachId: string) {
  return request.get<never, ApiSuccess<CoachDetail>>(`coaches/${coachId}`);
}

export function getCoachCourses(coachId: string) {
  return request.get<never, ApiSuccess<PublicCourse[]>>(`coaches/${coachId}/courses`);
}
