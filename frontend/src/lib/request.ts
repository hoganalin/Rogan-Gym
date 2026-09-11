import axios from "axios";
import { getDataFromCookieByKey } from "./cookie";
import { ROUTE_TABLE } from "./routeTable";

function verifyRoute(prefix: string, route: string, method: string): boolean {
  const key = `${method}-${prefix}`;
  const hasSubRoute = route.length > prefix.length;

  if (!Object.hasOwn(ROUTE_TABLE, key) && !hasSubRoute) {
    return false;
  }

  const config = ROUTE_TABLE[key];
  const subRoute = route.replace(prefix, "");

  if (subRoute === "") {
    return true;
  }

  if (Array.isArray(config)) {
    for (const pattern of config) {
      if (typeof pattern === "string" && subRoute === pattern) {
        return true;
      }
      if (pattern instanceof RegExp && pattern.test(subRoute)) {
        return true;
      }
    }
  }

  return false;
}

function notNeedAuth(url: string, method: string): boolean {
  const prefix = url.split("/")[0];
  return verifyRoute(prefix, url, method);
}

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

request.interceptors.request.use((config) => {
  const url = config.url ?? "";
  const method = config.method ?? "get";

  if (notNeedAuth(url, method)) {
    return config;
  }

  const token = getDataFromCookieByKey("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.reject(error);
  },
);

export default request;
