import { formatLocal } from "./formatDateTime.js";

// 檢查課程是否正在進行中
export function isCourseInProgress(startUtcTime, endUtcTime, now) {
  const start = formatLocal(startUtcTime);
  const end = formatLocal(endUtcTime);

  return now.isAfter(start) && now.isBefore(end);
}

// 檢查課程是否尚未開始
export function isCourseUpcoming(startUtcTime, now) {
  const start = formatLocal(startUtcTime);

  return now.isBefore(start);
}
