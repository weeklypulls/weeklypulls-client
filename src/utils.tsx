// Tiny path getter: safely access nested properties by dot path
export function getPath(obj: any, path: string, fallback?: any) {
  if (!obj || !path) return fallback;
  const parts = path.split(".");
  let cur: any = obj;
  for (const p of parts) {
    if (cur != null && Object.prototype.hasOwnProperty.call(cur, p)) {
      cur = cur[p];
    } else {
      return fallback;
    }
  }
  return cur === undefined ? fallback : cur;
}

import { IComicPullPair } from "./interfaces";

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

function stringAttrsSort(a: Record<string, any>, b: Record<string, any>, attrs: string[]) {
  for (const attr of attrs) {
    const av = getPath(a, attr);
    const bv = getPath(b, attr);
    if (av < bv) {
      return -1;
    }
    if (av > bv) {
      return 1;
    }
  }
  return 0;
}

function rowClassName(record: IComicPullPair) {
  const { read } = record;
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
