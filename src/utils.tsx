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

function rowClassName(record: IIssue) {
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
};
