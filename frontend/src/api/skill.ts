import request from "../lib/request";
import type { ApiOk, ApiSuccess, Skill } from "../types/api";

export function getSkills() {
  return request.get<never, ApiSuccess<Skill[]>>("coaches/skill");
}

export function postSkill(name: string) {
  return request.post<never, ApiSuccess<Skill>>("coaches/skill", { name });
}

// backend responds with { status: "success" } only — no `data` key.
export function deleteSkill(id: string) {
  return request.delete<never, ApiOk>(`coaches/skill/${id}`);
}
