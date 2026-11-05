import { describe, expect, it } from 'vitest';
import { addDays, dayOfMonth, dayTitle, formatLong, fromKey, toKey, weekDays, weekdayShort } from './dates';

describe('dates', () => {
  it('ключ даты строится в локальном времени', () => {
    expect(toKey(new Date(2026, 10, 5, 23, 59))).toBe('2026-11-05');
    expect(toKey(fromKey('2026-01-09'))).toBe('2026-01-09');
  });

  it('addDays переходит через месяц и год', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('неделя начинается с понедельника', () => {
    // 5 ноября 2026 — четверг
    expect(weekDays('2026-11-05')).toEqual([
      '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08',
    ]);
    // воскресенье остаётся в той же неделе
    expect(weekDays('2026-11-08')[0]).toBe('2026-11-02');
    expect(weekdayShort('2026-11-05')).toBe('Чт');
    expect(dayOfMonth('2026-11-05')).toBe(5);
  });

  it('подписи на русском', () => {
    expect(formatLong('2026-11-05')).toBe('Четверг, 5 ноября');
    expect(formatLong('2025-11-05', '2026-11-05')).toContain('2025');
    expect(dayTitle('2026-11-05', '2026-11-05')).toBe('Сегодня');
    expect(dayTitle('2026-11-04', '2026-11-05')).toBe('Вчера');
    expect(dayTitle('2026-11-06', '2026-11-05')).toBe('Завтра');
    expect(dayTitle('2026-11-02', '2026-11-05')).toBe('Понедельник');
  });
});
