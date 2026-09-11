import dayjs from "dayjs";

export function getDataFromCookieByKey(key) {
  const name = `${key}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(";");

  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return null;
}

export function setKeyFromCookie(name, token, exp) {
  const expiresDate = dayjs(exp * 1000).toISOString();
  const expires = `expires=${expiresDate}`;
  document.cookie = `${name}=${token}; ${expires}; path=/`;
}

export function removeCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}
