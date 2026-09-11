import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("zh-tw");

const weekdays = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];
const shortWeekdays = ["日", "一", "二", "三", "四", "五", "六"];

export function formatLocal(utcTime) {
  return dayjs.utc(utcTime).local();
}

export function toUTC(localTime) {
  return dayjs(localTime).utc().format();
}

export function formatLocalWeekDate(localDate) {
  const dateObj = dayjs(localDate);
  const weekday = weekdays[dateObj.day()];
  const month = String(dateObj.month() + 1).padStart(2, "0");
  const date = String(dateObj.date()).padStart(2, "0");

  return `${weekday} ${month}月${date}日`;
}

export function formatLocalDate(utcTime) {
  return formatLocal(utcTime).format("YYYY-MM-DD");
}

export function formatLocalTime(utcTime) {
  return formatLocal(utcTime).format("HH:mm");
}

export function formatCourseDateTime(startDateString, endDateString) {
  const startDate = dayjs(startDateString);
  const endDate = dayjs(endDateString);

  const weekday = shortWeekdays[startDate.day()];

  return `${startDate.format("M/D")} (${weekday}) ${startDate.format(
    "HH:mm"
  )}~${endDate.format("HH:mm")}`;
}

export function formatCoachCourseDateTime(startDateString, endDateString) {
  const startDate = dayjs(startDateString);
  const endDate = dayjs(endDateString);

  return `${startDate.format("YYYY-MM-DD")} ${startDate.format(
    "HH:mm"
  )}~${endDate.format("HH:mm")}`;
}

export function formatTimeRange(startUtcTime, endUtcTime) {
  const start = formatLocal(startUtcTime);
  const end = formatLocal(endUtcTime);

  return `${start.format("HH:mm")} ~ ${end.format("HH:mm")}`;
}

export function formatLocalDateTime(utcTime) {
  return formatLocal(utcTime).format("YYYY-MM-DD HH:mm");
}
