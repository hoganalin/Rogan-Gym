import request from "../lib/request";
import type { ApiSuccess, Skill } from "../types/api";

export function getSkills() {
  return request.get<never, ApiSuccess<Skill[]>>("coaches/skill");
}

export function postSkill(name: string) {
  return request.post<never, ApiSuccess<Skill>>("coaches/skill", { name });
}

export function deleteSkill(id: string) {
  return request.delete<never, ApiSuccess<null>>(`coaches/skill/${id}`);
}
