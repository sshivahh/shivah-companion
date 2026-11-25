// Dates are stored as local "YYYY-MM-DD" strings and handled in UTC math
// so that no device/server timezone can shift a lesson to another day.

export const ID_DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
export const ID_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
export const ID_MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
export const EN_DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const EN_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n: number) => String(n).padStart(2, "0");

export function parseYmd(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return { y, m, d };
}

export function toYmd(y: number, m: number, d: number) {
  return `${y}-${pad(m)}-${pad(d)}`;
}

export function isYmd(s: unknown): s is string {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const { y, m, d } = parseYmd(s);
  return m >= 1 && m <= 12 && d >= 1 && d <= daysInMonth(y, m);
}

function utc(ymd: string) {
  const { y, m, d } = parseYmd(ymd);
  return new Date(Date.UTC(y, m - 1, d));
}

export function weekday(ymd: string) {
  return utc(ymd).getUTCDay();
}

export function addDays(ymd: string, n: number) {
  const dt = utc(ymd);
  dt.setUTCDate(dt.getUTCDate() + n);
  return toYmd(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

export function daysInMonth(y: number, m: number) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function todayYmd(timeZone = process.env.APP_TIMEZONE || "Asia/Jakarta") {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());
}

/** "YYYY-MM" */
export function monthKey(ymd: string) {
  return ymd.slice(0, 7);
}

export function isMonthKey(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(s);
}

export function addMonths(mk: string, n: number) {
  const [y, m] = mk.split("-").map(Number);
  const idx = y * 12 + (m - 1) + n;
  return `${Math.floor(idx / 12)}-${pad((idx % 12) + 1)}`;
}

export function monthRange(mk: string) {
  const [y, m] = mk.split("-").map(Number);
  return { start: toYmd(y, m, 1), end: toYmd(y, m, daysInMonth(y, m)), y, m };
}

export function monthLabel(mk: string) {
  const [y, m] = mk.split("-").map(Number);
  return { month: EN_MONTHS[m - 1], year: y };
}

/** "Selasa, 3 Nov" — the WhatsApp log format */
export function formatIndo(ymd: string) {
  const { m, d } = parseYmd(ymd);
  return `${ID_DAYS[weekday(ymd)]}, ${d} ${ID_MONTHS_SHORT[m - 1]}`;
}

/** "Tue 3 Nov" */
export function formatShort(ymd: string) {
  const { m, d } = parseYmd(ymd);
  return `${EN_DAYS_SHORT[weekday(ymd)]} ${d} ${EN_MONTHS[m - 1].slice(0, 3)}`;
}

export function relativeLabel(ymd: string, today: string) {
  if (ymd === today) return "Today";
  if (ymd === addDays(today, -1)) return "Yesterday";
  if (ymd === addDays(today, 1)) return "Tomorrow";
  return formatShort(ymd);
}

/** Builds the same text that used to go into WhatsApp. Adds the time only when a day has two lessons. */
export function whatsappText(name: string, mk: string, entries: { date: string; time: string | null }[]) {
  const [, m] = mk.split("-").map(Number);
  const sorted = [...entries].sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")));
  const perDay = new Map<string, number>();
  for (const e of sorted) perDay.set(e.date, (perDay.get(e.date) ?? 0) + 1);
  const lines = sorted.map(
    (e, i) => `${i + 1}. ${formatIndo(e.date)}${perDay.get(e.date)! > 1 && e.time ? ` (${e.time})` : ""}`,
  );
  return `${name} ${ID_MONTHS[m - 1]}:\n${lines.join("\n")}`;
}

export const EN_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Monday of the week containing this date. */
export function weekStart(ymd: string) {
  return addDays(ymd, -((weekday(ymd) + 6) % 7));
}
