import { describe, expect, it } from 'vitest';
import type { Category, Task } from '../types';
import { applyCarry, dayCarryOffer, findCarryOffer } from './carry';

const TODAY = '2026-11-16';
const YESTERDAY = '2026-11-15';
const OLD = '2026-11-05';

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
  it('плашка собирает незакрытое из всех прошлых дней: по дням, внутри дня — в порядке показа', () => {
    const a = task(YESTERDAY, false, { order: 2 });
    const b = task(YESTERDAY, true);
    const c = task(YESTERDAY, false, { order: 0, categoryId: 'health' });
    const old = task(OLD, false);
    const offer = findCarryOffer([a, b, c, old, task(TODAY, false)], cats, TODAY);
    expect(offer).toEqual({ from: OLD, to: YESTERDAY, tasks: [old, c, a] });
  });

  it('находит старые хвосты, даже если последний день закрыт полностью', () => {
    const old = task(OLD, false);
    const lastDone = task(YESTERDAY, true);
    expect(findCarryOffer([old, lastDone], cats, TODAY)?.tasks).toEqual([old]);
  });

  it('ничего не предлагает: нет прошлых дней, всё перенесено, архивная категория', () => {
    expect(findCarryOffer([task(TODAY, false), task('2026-11-17', false)], cats, TODAY)).toBeNull();
    expect(findCarryOffer([task(YESTERDAY, false, { carriedTo: TODAY })], cats, TODAY)).toBeNull();
    expect(findCarryOffer([task(YESTERDAY, false, { categoryId: 'old' })], cats, TODAY)).toBeNull();
  });

  it('«Не нужно» прячет дни по отклонённый включительно, новые дни показывает', () => {
    const old = task(OLD, false);
    const mid = task('2026-11-10', false);
    const fresh = task(YESTERDAY, false);
    expect(findCarryOffer([old, mid], cats, TODAY, '2026-11-10')).toBeNull();
    expect(findCarryOffer([old, mid, fresh], cats, TODAY, '2026-11-10')?.tasks).toEqual([fresh]);
  });

  it('кнопка на прошлом дне берёт только этот день и не зависит от «Не нужно»', () => {
    const old = task(OLD, false);
    const oldDone = task(OLD, true);
    const other = task(YESTERDAY, false);
    const tasks = [old, oldDone, other];
    expect(dayCarryOffer(tasks, cats, OLD, TODAY)).toEqual({ from: OLD, to: OLD, tasks: [old] });
    expect(dayCarryOffer(tasks, cats, TODAY, TODAY)).toBeNull();
    expect(dayCarryOffer([oldDone], cats, OLD, TODAY)).toBeNull();
  });

  it('копирует задачи в низ категорий сегодня, оригиналы помечает, у копий — свой день-источник', () => {
    const a = task(OLD, false, { categoryId: 'work' });
    const b = task(YESTERDAY, false, { categoryId: 'work' });
    const done = task(YESTERDAY, true, { categoryId: 'work' });
    const todayTask = task(TODAY, false, { categoryId: 'work', order: 0 });
    const tasks = [a, b, done, todayTask];
    const offer = findCarryOffer(tasks, cats, TODAY)!;
    const result = applyCarry(tasks, offer, TODAY, makeId, 1000);

    expect(result).toHaveLength(6);
    expect(result.find((t) => t.id === a.id)).toMatchObject({ done: false, carriedTo: TODAY, date: OLD });
    expect(result.find((t) => t.id === done.id)).toBe(done);
    expect(result.find((t) => t.id === todayTask.id)).toBe(todayTask);

    const copies = result.filter((t) => t.carriedFrom);
    expect(copies.map((t) => [t.title, t.date, t.done, t.order, t.carriedFrom])).toEqual([
      [a.title, TODAY, false, 1, OLD],
      [b.title, TODAY, false, 2, YESTERDAY],
    ]);
    expect(findCarryOffer(result, cats, TODAY)).toBeNull();
  });
});
