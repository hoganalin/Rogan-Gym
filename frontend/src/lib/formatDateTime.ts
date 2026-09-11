import dayjs from "dayjs";

export function formatCourseTime(startAt: string, endAt: string): string {
  const start = dayjs(startAt);
  const end = dayjs(endAt);
  return `${start.format("YYYY/M/D HH:mm")} - ${end.format("HH:mm")}`;
}
