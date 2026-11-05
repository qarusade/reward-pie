import { describe, expect, it } from 'vitest';
import type { Category, Task } from '../types';
import { categoriesForDay, dayStats, historyDays, pieGeometry, progressOf, rewardCount } from './stats';

let seq = 0;
const task = (categoryId: string, date: string, done: boolean): Task => ({
  id: String(++seq), categoryId, date, title: 't' + seq, done, createdAt: seq,
});
const cat = (id: string, createdAt: number, archived = false): Category => ({
  id, name: id, color: '#000', reward: { kind: 'pizza', name: 'Пицца' }, createdAt, archived,
});

describe('progressOf', () => {
  it('1 из 6 — 17%, награда закрыта', () => {
    const tasks = [task('a', 'd', true), ...Array.from({ length: 5 }, () => task('a', 'd', false))];
    expect(progressOf(tasks)).toEqual({ total: 6, done: 1, pct: 17, open: false });
  });
  it('пустая категория не считается открытой', () => {
    expect(progressOf([])).toEqual({ total: 0, done: 0, pct: 0, open: false });
  });
  it('всё закрыто — награда открыта', () => {
    expect(progressOf([task('a', 'd', true), task('a', 'd', true)]).open).toBe(true);
  });
});

describe('pieGeometry', () => {
  it('режет круг на столько кусков, сколько задач', () => {
    expect(pieGeometry(1, 6)).toEqual({ deg: 60, slice: 60 });
    expect(pieGeometry(3, 3)).toEqual({ deg: 360, slice: 120 });
  });
  it('без задач — ничего не открыто', () => {
    expect(pieGeometry(0, 0)).toEqual({ deg: 0, slice: 360 });
  });
  it('не выходит за границы', () => {
    expect(pieGeometry(9, 3).deg).toBe(360);
  });
});

describe('dayStats', () => {
  it('считает открытые награды только по категориям с задачами в этот день', () => {
    const tasks = [
      task('work', '2026-11-05', true), task('work', '2026-11-05', false),
      task('health', '2026-11-05', true), task('health', '2026-11-05', true),
      task('mentor', '2026-11-04', true),
    ];
    const s = dayStats(tasks, '2026-11-05');
    expect(s.total).toBe(4);
    expect(s.done).toBe(3);
    expect(s.pct).toBe(75);
    expect(s.rewardsOpen).toBe(1);
    expect(s.rewardsTotal).toBe(2);
    expect(s.openCategoryIds).toEqual(['health']);
  });
});

describe('история и счётчики', () => {
  it('дни с задачами — от новых к старым', () => {
    const tasks = [task('a', '2026-11-03', false), task('a', '2026-11-05', false), task('b', '2026-11-03', true)];
    expect(historyDays(tasks)).toEqual(['2026-11-05', '2026-11-03']);
  });

  it('награда категории засчитывается за каждый полностью закрытый день', () => {
    const tasks = [
      task('a', '2026-11-01', true), task('a', '2026-11-01', true),
      task('a', '2026-11-02', true), task('a', '2026-11-02', false),
      task('a', '2026-11-03', true),
      task('b', '2026-11-03', true),
    ];
    expect(rewardCount(tasks, 'a')).toBe(2);
    expect(rewardCount(tasks, 'b')).toBe(1);
  });

  it('архивная категория видна только в днях, где у неё были задачи', () => {
    const cats = [cat('new', 2), cat('old', 1, true)];
    expect(categoriesForDay(cats, []).map((c) => c.id)).toEqual(['new']);
    expect(categoriesForDay(cats, [task('old', 'd', true)]).map((c) => c.id)).toEqual(['old', 'new']);
  });
});
