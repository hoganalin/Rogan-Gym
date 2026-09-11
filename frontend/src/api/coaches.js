import request from "./request.js";
export function getCoaches(per, page) {
  return request.get(`coaches/?per=${per}&page=${page}`);
}

export function getCoachDetail(coachId) {
  return request.get(`coaches/${coachId}`);
}

export function getCoachCourses(coachId) {
  return request.get(`coaches/${coachId}/courses`);
}

export function getSkills() {
  return request.get(`coaches/skill`);
}

export function postSkill(data) {
  return request.post(`coaches/skill`, data);
}

export function deleteSkill(id) {
  return request.delete(`coaches/skill/${id}`);
}
