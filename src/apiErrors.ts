import { isAxiosError } from "axios";

const FIELD_LABELS: Record<string, string> = {
  username: "Username",
  email: "Email",
  password: "Password",
  password1: "Password",
  password2: "Confirm password",
  new_password1: "New password",
  new_password2: "Confirm password",
};

// Turns a DRF error response ({"field": ["msg"], "non_field_errors": [...],
// "detail": "..."}) into lines a person can read.
export function apiErrorMessages(err: unknown, fallback = "Something went wrong."): string[] {
  if (!isAxiosError(err)) return [fallback];
  if (!err.response) return ["Couldn't reach WeeklyPulls. Check your connection and try again."];
  if (err.response.status === 429) return ["Too many attempts. Please wait a bit and try again."];

  const data: unknown = err.response.data;
  if (typeof data === "string" || !data || typeof data !== "object") return [fallback];

  const lines: string[] = [];
  for (const [field, value] of Object.entries(data as Record<string, unknown>)) {
    const messages = (Array.isArray(value) ? value : [value]).filter(
      (m): m is string => typeof m === "string"
    );
    const label = FIELD_LABELS[field];
    for (const m of messages) lines.push(label ? `${label}: ${m}` : m);
  }
  return lines.length ? lines : [fallback];
}

export function isUnverifiedEmailError(err: unknown): boolean {
  return apiErrorMessages(err).some((m) => /not verified/i.test(m));
}
