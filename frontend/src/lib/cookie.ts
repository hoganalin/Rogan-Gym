import dayjs from "dayjs";

export function getDataFromCookieByKey(key: string): string | null {
  const name = `${key}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(";");

  for (const raw of cookieArray) {
    const cookie = raw.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length);
    }
  }
  return null;
}

export function setKeyFromCookie(name: string, token: string, exp: number): void {
  const expiresDate = dayjs(exp * 1000).toISOString();
  document.cookie = `${name}=${token}; expires=${expiresDate}; path=/`;
}

export function removeCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}
