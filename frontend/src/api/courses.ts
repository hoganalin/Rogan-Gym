import request from "../lib/request";
import type { ApiSuccess, PublicCourse } from "../types/api";

export function getCourses() {
  return request.get<never, ApiSuccess<PublicCourse[]>>("courses");
}

export function postCourseBooking(courseId: string) {
  return request.post<never, ApiSuccess<null>>(`courses/${courseId}`);
}

export function deleteCourseBooking(courseId: string) {
  return request.delete<never, ApiSuccess<null>>(`courses/${courseId}`);
}
