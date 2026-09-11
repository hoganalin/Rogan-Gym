import request from "./request.js";
export function getCoach() {
  return request.get(`admin/coaches`);
}

export function putCoach(data) {
  return request.put(`admin/coaches`, data);
}

export function getAdminCoachCourses() {
  return request.get(`admin/coaches/courses`);
}

export function getCoachCourse(id) {
  return request.get(`admin/coaches/courses/${id}`);
}

export function postCourses(data) {
  return request.post(`admin/coaches/courses`, data);
}

export function putCourses(data, id) {
  return request.put(`admin/coaches/courses/${id}`, data);
}

export function getMonthlyRevenue(month) {
  return request.get(`admin/coaches/revenue?month=${month}`);
}

export function postPromoteUserToCoach(id, data) {
  return request.post(`admin/coaches/${id}`, data);
}
