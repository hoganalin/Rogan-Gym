import request from "../lib/request";
import type { ApiSuccess, CoachCard, CoachDetail, CoachListItem, PublicCourse } from "../types/api";

export function getCoaches(per: number, page: number) {
  return request.get<never, ApiSuccess<CoachListItem[]>>(`coaches/?per=${per}&page=${page}`);
}

export function getCoachDetail(coachId: string) {
  return request.get<never, ApiSuccess<CoachDetail>>(`coaches/${coachId}`);
}

export function getCoachCourses(coachId: string) {
  return request.get<never, ApiSuccess<PublicCourse[]>>(`coaches/${coachId}/courses`);
}

// Recomposes GET /coaches with per-coach GET /coaches/:id and
// GET /coaches/:id/courses so views can render image/years/skills/upcoming
// courses without a dedicated list endpoint for them.
export async function getCoachCards(per: number, page: number): Promise<ApiSuccess<CoachCard[]>> {
  const { data: list } = await getCoaches(per, page);
  const data = await Promise.all(
    list.map(async (item): Promise<CoachCard> => {
      const [{ data: detail }, { data: upcomingCourses }] = await Promise.all([
        getCoachDetail(item.id),
        getCoachCourses(item.id),
      ]);
      return {
        ...item,
        experience_years: detail.coach.experience_years,
        description: detail.coach.description,
        profile_image_url: detail.coach.profile_image_url,
        skills: detail.coach.skills,
        upcomingCourses,
      };
    }),
  );
  return { status: "success", data };
}
