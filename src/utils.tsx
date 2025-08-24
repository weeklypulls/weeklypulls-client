type PathImpl<T, K extends keyof T> = K extends string
  ? T[K] extends Record<string, unknown>
    ? K | `${K}.${PathImpl<T[K], keyof T[K]>}`
    : K
  : never;

export type Path<T> = PathImpl<T, keyof T>;

// Given a T and a valid dot path P, get the value type at that path
export type PathValue<T, P extends Path<T>> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? PathValue<T[K], Extract<Rest, Path<T[K]>>>
    : never
  : P extends keyof T
    ? T[P]
    : never;

// Tiny path getter: safely access nested properties by dot path
export function getPath<T extends object, P extends Path<T>, R = unknown>(
  obj: T,
  path: P,
  fallback?: R
): PathValue<T, P> | R {
  if (!obj || !path) return fallback as R;

  const parts = String(path).split(".") as readonly string[];
  let cur: unknown = obj;

  for (const p of parts) {
    if (cur !== null && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return fallback as R;
    }
  }

  return (cur === undefined ? fallback : (cur as PathValue<T, P>)) as PathValue<T, P> | R;
}

import { IIssue } from "./interfaces";

// Helper: format a Date to YYYY-MM-DD using local time
function formatISODateLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Helper: parse YYYY-MM-DD into a local Date (avoids UTC parsing quirks)
function parseISODateLocal(iso: string) {
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  return new Date(y, (m || 1) - 1, d || 1);
}

function stringSort(a: string, b: string) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

function future(week: string) {
  // week is in YYYY-MM-DD
  const date = parseISODateLocal(week);
  return date.getTime() > Date.now();
}

function nearFuture(week: string) {
  const date = parseISODateLocal(week);
  const now = Date.now();
  const tooFar = now + 7 * 24 * 60 * 60 * 1000; // +1 week
  const t = date.getTime();
  return t > now && t < tooFar;
}

function farFuture(week: string) {
  const date = parseISODateLocal(week);
  const tooFar = Date.now() + 7 * 24 * 60 * 60 * 1000; // +1 week
  return date.getTime() > tooFar;
}

function nearestWed() {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun,1=Mon,2=Tue,3=Wed
  const diff = 3 - dow; // days to Wednesday of current week
  const wed = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diff);
  return formatISODateLocal(wed);
}

function nextWeek(weekIso: string) {
  const d = parseISODateLocal(weekIso);
  d.setDate(d.getDate() + 7);
  return formatISODateLocal(d);
}

function prevWeek(weekIso: string) {
  const d = parseISODateLocal(weekIso);
  d.setDate(d.getDate() - 7);
  return formatISODateLocal(d);
}

export function stringAttrsSort<T extends object, P extends Path<T>>(
  a: T,
  b: T,
  attrs: readonly P[]
): number {
  for (const attr of attrs) {
    const av = String(getPath<T, P, unknown>(a, attr) ?? "");
    const bv = String(getPath<T, P, unknown>(b, attr) ?? "");
    const cmp = av.localeCompare(bv);
    if (cmp !== 0) return cmp;
  }
  return 0;
}

function rowClassName(record: IIssue) {
  // Legacy pair shape
  // kept for safety if mixed shapes appear; but IIssue path used now
  // New IIssue shape uses pull.read
  const read = record.pull?.read ?? false;
  return read ? "comic-read" : "comic-toread";
}

export default {
  farFuture,
  future,
  nearestWed,
  nearFuture,
  nextWeek,
  prevWeek,
  rowClassName,
  stringAttrsSort,
  stringSort,
};
