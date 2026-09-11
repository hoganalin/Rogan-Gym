import request from "./request.js";
export function getCreditPackages() {
  return request.get("credit-package");
}

export function postCreditPackage(id) {
  return request.post(`credit-package/${id}`);
}
