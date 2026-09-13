const API_BASE = "http://127.0.0.1:8080/api";

interface JsonResponse {
  status: string;
  message?: string;
  data?: unknown;
}

async function postJson(path: string, body: unknown, token?: string): Promise<JsonResponse> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as JsonResponse;
  if (!res.ok) {
    throw new Error(`POST ${path} failed (${res.status}): ${json.message ?? JSON.stringify(json)}`);
  }
  return json;
}

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

export async function signup(name: string, email: string, password: string): Promise<string> {
  const json = await postJson("/users/signup", { name, email, password });
  const data = json.data as { user: { id: string } };
  return data.user.id;
}

export async function login(email: string, password: string): Promise<string> {
  const json = await postJson("/users/login", { email, password });
  const data = json.data as { token: string };
  return data.token;
}

export async function promoteToCoach(userId: string): Promise<string> {
  const json = await postJson(`/admin/coaches/${userId}`, {
    experience_years: 5,
    description: "E2E fixture coach",
    profile_image_url: "https://example.com/coach.jpg",
  });
  const data = json.data as { coach: { id: string } };
  return data.coach.id;
}

export async function createSkill(token: string, name: string): Promise<string> {
  const json = await postJson("/coaches/skill", { name }, token);
  const data = json.data as { id: string };
  return data.id;
}

export async function createCourse(token: string, skillId: string, name: string): Promise<void> {
  const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  await postJson(
    "/admin/coaches/courses",
    {
      skill_id: skillId,
      name,
      description: "E2E fixture course",
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      max_participants: 10,
      meeting_url: "https://example.com/meeting",
    },
    token,
  );
}

export async function createCreditPackage(name: string, price: number, creditAmount: number): Promise<void> {
  await postJson("/credit-package", { name, price, credit_amount: creditAmount });
}
