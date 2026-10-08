const JALALI_MONTHS = [
  'Farvardin',
  'Ordibehesht',
  'Khordad',
  'Tir',
  'Mordad',
  'Shahrivar',
  'Mehr',
  'Aban',
  'Azar',
  'Dey',
  'Bahman',
  'Esfand',
] as const;

/** Gregorian calendar day key for storage / sorting (YYYY-MM-DD). */
export const dayKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** Convert Gregorian y/m/d to Jalali. */
function toJalali(gy: number, gm: number, gd: number) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy, jm, jd };
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function jalaliDateParts(date: Date) {
  const { jy, jm, jd } = toJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return { jy, jm, jd, monthName: JALALI_MONTHS[jm - 1] };
}

/** Jalali date for display: `16 Mehr 1405`. Optional English weekday prefix. */
export const dayText = (
  key: string,
  options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' },
) => {
  const date = new Date(`${key}T12:00:00`);
  const { jy, jd, monthName } = jalaliDateParts(date);
  const datePart = `${jd} ${monthName} ${jy}`;
  if (options.weekday) {
    const weekday = new Intl.DateTimeFormat('en', { weekday: options.weekday }).format(date);
    return `${weekday}, ${datePart}`;
  }
  return datePart;
};

/** Full moment — Jalali date + 24h time: `16 Mehr 1405, 20:25`. */
export const dateTimeText = (iso: string) => {
  const date = new Date(iso);
  const { jy, jd, monthName } = jalaliDateParts(date);
  return `${jd} ${monthName} ${jy}, ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
};

export const timeText = (iso: string) => {
  const date = new Date(iso);
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
};

export const ago = (iso: string) => {
  const days = Math.max(
    0,
    Math.floor(
      (new Date(`${dayKey()}T12:00:00`).getTime() - new Date(`${iso.slice(0, 10)}T12:00:00`).getTime()) /
        86400000,
    ),
  );
  if (days === 0) return `today · ${timeText(iso)}`;
  if (days === 1) return `yesterday · ${timeText(iso)}`;
  return dateTimeText(iso);
};
