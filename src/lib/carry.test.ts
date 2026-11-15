import { describe, expect, it } from 'vitest';
import type { Category, Task } from '../types';
import { applyCarry, findCarryOffer } from './carry';

const TODAY = '2026-11-06';
const YESTERDAY = '2026-11-05';

let seq = 0;
const task = (date: string, done: boolean, extra: Partial<Task> = {}): Task => ({
  id: `t${++seq}`,
  categoryId: 'work',
  date,
  title: `задача ${seq}`,
  done,
  createdAt: seq,
  order: seq,
  ...extra,
});
const cat = (id: string, archived = false): Category => ({
  id,
  name: id,
  color: '#000',
  reward: { kind: 'pizza', name: 'Пицца' },
  createdAt: 0,
  archived,
});
const cats = [cat('work'), cat('health'), cat('old', true)];
let n = 0;
const makeId = () => `new${++n}`;

describe('перенос незакрытых задач', () => {
  it('предлагает незакрытые задачи последнего прошлого дня в порядке показа', () => {
    const a = task(YESTERDAY, false, { order: 2 });
    const b = task(YESTERDAY, true);
    const c = task(YESTERDAY, false, { order: 0, categoryId: 'health' });
    const offer = findCarryOffer([a, b, c, task(TODAY, false)], cats, TODAY);
    expect(offer).toEqual({ from: YESTERDAY, tasks: [c, a], total: 3 });
  });

  it('смотрит только на последний прошлый день, даже если был пропуск', () => {
    const old = task('2026-11-02', false);
    const lastDone = task('2026-11-04', true);
    expect(findCarryOffer([old, lastDone], cats, TODAY)).toBeNull();
    const lastOpen = task('2026-11-04', false);
    expect(findCarryOffer([old, lastOpen], cats, TODAY)?.from).toBe('2026-11-04');
  });

  it('ничего не предлагает: нет прошлых дней, всё уже перенесено, «Не нужно» или архивная категория', () => {
    expect(findCarryOffer([task(TODAY, false), task('2026-11-07', false)], cats, TODAY)).toBeNull();
    expect(findCarryOffer([task(YESTERDAY, false, { carriedTo: TODAY })], cats, TODAY)).toBeNull();
    expect(findCarryOffer([task(YESTERDAY, false)], cats, TODAY, YESTERDAY)).toBeNull();
    expect(findCarryOffer([task(YESTERDAY, false, { categoryId: 'old' })], cats, TODAY)).toBeNull();
  });

  it('копирует задачи в низ категорий сегодня, а оригиналы помечает', () => {
    const a = task(YESTERDAY, false, { categoryId: 'work' });
    const b = task(YESTERDAY, false, { categoryId: 'work' });
    const done = task(YESTERDAY, true, { categoryId: 'work' });
    const todayTask = task(TODAY, false, { categoryId: 'work', order: 0 });
    const tasks = [a, b, done, todayTask];
    const offer = findCarryOffer(tasks, cats, TODAY)!;
    const result = applyCarry(tasks, offer, TODAY, makeId, 1000);

    expect(result).toHaveLength(6);
    expect(result.find((t) => t.id === a.id)).toMatchObject({ done: false, carriedTo: TODAY, date: YESTERDAY });
    expect(result.find((t) => t.id === done.id)).toBe(done);
    expect(result.find((t) => t.id === todayTask.id)).toBe(todayTask);

    const copies = result.filter((t) => t.carriedFrom === YESTERDAY);
    expect(copies.map((t) => [t.title, t.date, t.done, t.order])).toEqual([
      [a.title, TODAY, false, 1],
      [b.title, TODAY, false, 2],
    ]);
    expect(findCarryOffer(result, cats, TODAY)).toBeNull();
  });
});
