import request from "../lib/request";
import type { ApiSuccess, LoginPayload, LoginResult, SignupPayload, SignupResult } from "../types/api";

export function postSignup(data: SignupPayload) {
  return request.post<never, ApiSuccess<SignupResult>>("users/signup", data);
}

export function postLogin(data: LoginPayload) {
  return request.post<never, ApiSuccess<LoginResult>>("users/login", data);
}
