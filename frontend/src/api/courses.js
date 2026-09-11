import request from "./request.js";
export function postCourse(id) {
  return request.post(`courses/${id}`);
}

export function deleteCourse(id) {
  return request.delete(`courses/${id}`);
}
