import request from "../lib/request";
import type { ApiSuccess, CreditPackage } from "../types/api";

export function getCreditPackages() {
  return request.get<never, ApiSuccess<CreditPackage[]>>("credit-package");
}

export function postCreditPackage(id: string) {
  return request.post<never, ApiSuccess<null>>(`credit-package/${id}`);
}
