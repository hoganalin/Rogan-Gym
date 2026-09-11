type RoutePattern = string | RegExp;

export const ROUTE_TABLE: Record<string, true | RoutePattern[]> = {
  "post-users": ["/signup", "/login"],
  "get-courses": true,
  "get-credit-package": true,
  "post-credit-package": true,
  "get-coaches": [
    "/skill",
    /^\/[0-9a-f-]+$/i, // /:coachId
    /^\/\?.*$/, // /?per=&page=
    /^\/[0-9a-f-]+\/courses$/i, // /:coachId/courses
  ],
  "post-coaches": ["/skill"],
  "delete-coaches": [/^\/skill\/[0-9a-f-]+$/i],
};
