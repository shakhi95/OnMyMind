export const dayKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const dayText = (
  key: string,
  options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' },
) => new Intl.DateTimeFormat('en', options).format(new Date(`${key}T12:00:00`));

/** Full moment from an ISO timestamp — date + time. */
export const dateTimeText = (
  iso: string,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  },
) => new Intl.DateTimeFormat('en', options).format(new Date(iso));

export const timeText = (iso: string) =>
  new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date(iso));

export const ago = (iso: string) => {
  const days = Math.max(
    0,
    Math.floor(
      (new Date(`${dayKey()}T12:00:00`).getTime() - new Date(`${iso.slice(0, 10)}T12:00:00`).getTime()) /
        86400000,
    ),
  );
  const time = timeText(iso);
  if (days === 0) return `today · ${time}`;
  if (days === 1) return `yesterday · ${time}`;
  return `${days} days ago · ${time}`;
};
