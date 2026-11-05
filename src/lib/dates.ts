import type { DateKey } from '../types';

const pad = (n: number) => String(n).padStart(2, '0');

export function toKey(d: Date): DateKey {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(now: Date = new Date()): DateKey {
  return toKey(now);
}

export function addDays(key: DateKey, n: number): DateKey {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

/** 0 = понедельник … 6 = воскресенье */
export function weekdayIndex(key: DateKey): number {
  return (fromKey(key).getDay() + 6) % 7;
}

/** Семь дней недели (с понедельника), в которую попадает дата. */
export function weekDays(key: DateKey): DateKey[] {
  const monday = addDays(key, -weekdayIndex(key));
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

const WEEKDAY_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function weekdayShort(key: DateKey): string {
  return WEEKDAY_SHORT[weekdayIndex(key)];
}

export function dayOfMonth(key: DateKey): number {
  return fromKey(key).getDate();
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const longFmt = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
const longYearFmt = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const weekdayFmt = new Intl.DateTimeFormat('ru-RU', { weekday: 'long' });

/** «Четверг, 5 ноября»; год добавляется, если он не совпадает с годом `today`. */
export function formatLong(key: DateKey, today?: DateKey): string {
  const sameYear = !today || key.slice(0, 4) === today.slice(0, 4);
  return capitalize((sameYear ? longFmt : longYearFmt).format(fromKey(key)));
}

/** Заголовок экрана дня: «Сегодня», «Вчера», «Завтра» или день недели. */
export function dayTitle(key: DateKey, today: DateKey): string {
  if (key === today) return 'Сегодня';
  if (key === addDays(today, -1)) return 'Вчера';
  if (key === addDays(today, 1)) return 'Завтра';
  return capitalize(weekdayFmt.format(fromKey(key)));
}
