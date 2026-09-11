import { isAxiosError } from "axios";
import type { ApiErrorBody } from "../types/api";

export function extractErrorMessage(error: unknown, fallback = "發生錯誤，請稍後再試"): string {
  if (isAxiosError<ApiErrorBody>(error) && error.response?.data?.message) {
    return error.response.data.message;
  }
  return fallback;
}
