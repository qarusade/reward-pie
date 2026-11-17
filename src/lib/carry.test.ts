import { describe, expect, it } from 'vitest';
import type { Category, Task } from '../types';
import {
  applyCarry,
  dayCarryOffer,
  deleteWithUncarry,
  findCarryOffer,
  taskCarryOffer,
  undoBulkCarry,
} from './carry';

const TODAY = '2026-11-18';
const YESTERDAY = '2026-11-17';
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

describe('плашка переноса на «Сегодня»', () => {
  it('предлагает только вчерашнее незакрытое, в порядке показа', () => {
    const a = task(YESTERDAY, false, { order: 2 });
    const b = task(YESTERDAY, true);
    const c = task(YESTERDAY, false, { order: 0, categoryId: 'health' });
    const old = task(OLD, false);
    const offer = findCarryOffer([a, b, c, old, task(TODAY, false)], cats, TODAY);
    expect(offer).toEqual({ from: YESTERDAY, to: YESTERDAY, tasks: [c, a] });
  });

  it('старые хвосты не предлагает, даже если вчера задач не было', () => {
    expect(findCarryOffer([task(OLD, false), task('2026-11-16', false)], cats, TODAY)).toBeNull();
  });

  it('молчит: всё перенесено, архивная категория, «Не нужно» за вчера', () => {
    expect(findCarryOffer([task(YESTERDAY, false, { carriedTo: TODAY })], cats, TODAY)).toBeNull();
    expect(findCarryOffer([task(YESTERDAY, false, { categoryId: 'old' })], cats, TODAY)).toBeNull();
    expect(findCarryOffer([task(YESTERDAY, false)], cats, TODAY, YESTERDAY)).toBeNull();
    // отказ от позавчерашнего вчерашнее не прячет
    expect(findCarryOffer([task(YESTERDAY, false)], cats, TODAY, '2026-11-16')).not.toBeNull();
  });
});

describe('ручной перенос с прошлых дней', () => {
  it('кнопка дня берёт только этот день', () => {
    const old = task(OLD, false);
    const oldDone = task(OLD, true);
    const tasks = [old, oldDone, task(YESTERDAY, false)];
    expect(dayCarryOffer(tasks, cats, OLD, TODAY)).toEqual({ from: OLD, to: OLD, tasks: [old] });
    expect(dayCarryOffer(tasks, cats, TODAY, TODAY)).toBeNull();
  });

  it('кнопка у задачи переносит одну задачу из любого прошлого дня', () => {
    const old = task(OLD, false);
    const done = task(OLD, true);
    const future = task('2026-11-20', false);
    const archived = task(OLD, false, { categoryId: 'old' });
    const tasks = [old, done, future, archived];
    expect(taskCarryOffer(tasks, cats, old.id, TODAY)?.tasks).toEqual([old]);
    for (const t of [done, future, archived]) expect(taskCarryOffer(tasks, cats, t.id, TODAY)).toBeNull();
  });

  it('копия встаёт в низ категории сегодня с днём-источником, оригинал помечается', () => {
    const a = task(OLD, false);
    const todayTask = task(TODAY, false, { order: 0 });
    const result = applyCarry([a, todayTask], taskCarryOffer([a], cats, a.id, TODAY)!, TODAY, makeId, 1000);
    expect(result.find((t) => t.id === a.id)).toMatchObject({ carriedTo: TODAY, done: false, date: OLD });
    expect(result.find((t) => t.carriedFrom)).toMatchObject({ title: a.title, date: TODAY, order: 1, carriedFrom: OLD });
  });
});

describe('удаление перенесённой копии', () => {
  it('возвращает оригинал: его снова можно перенести', () => {
    const a = task(OLD, false);
    const carried = applyCarry([a], taskCarryOffer([a], cats, a.id, TODAY)!, TODAY, makeId, 1000);
    const copy = carried.find((t) => t.carriedFrom)!;
    const after = deleteWithUncarry(carried, copy.id);
    expect(after).toEqual([{ ...a }]);
    expect(after[0]).not.toHaveProperty('carriedTo');
  });

  it('обычная задача просто удаляется', () => {
    const a = task(TODAY, false);
    const b = task(TODAY, false);
    expect(deleteWithUncarry([a, b], a.id)).toEqual([b]);
  });
});

describe('ремонт после массового переноса', () => {
  it('убирает незакрытые копии из старых дней, оставляет вчерашние и сделанные', () => {
    const old1 = task(OLD, false, { carriedTo: TODAY, title: 'старая 1' });
    const old2 = task(OLD, false, { carriedTo: TODAY, title: 'старая 2' });
    const y = task(YESTERDAY, false, { carriedTo: TODAY, title: 'вчерашняя' });
    const copyOld1 = task(TODAY, false, { carriedFrom: OLD, title: 'старая 1' });
    const copyOld2Done = task(TODAY, true, { carriedFrom: OLD, title: 'старая 2' });
    const copyY = task(TODAY, false, { carriedFrom: YESTERDAY, title: 'вчерашняя' });
    const mine = task(TODAY, false, { title: 'своя' });
    const result = undoBulkCarry([old1, old2, y, copyOld1, copyOld2Done, copyY, mine]);

    expect(result.map((t) => t.title)).toEqual(['старая 1', 'старая 2', 'вчерашняя', 'старая 2', 'вчерашняя', 'своя']);
    expect(result[0]).not.toHaveProperty('carriedTo'); // вернулась, можно перенести снова
    expect(result[1].carriedTo).toBe(TODAY); // её копия уже сделана — пометка остаётся
    expect(result[2].carriedTo).toBe(TODAY);
  });

  it('снимает пометку «перенесена» с оригинала, чью копию удалили вручную', () => {
    const orphan = task(OLD, false, { carriedTo: '2026-11-16' });
    expect(undoBulkCarry([orphan])[0]).not.toHaveProperty('carriedTo');
  });

  it('не трогает копию, если не нашёл оригинал, и ничего не меняет на чистых данных', () => {
    const lonely = task(TODAY, false, { carriedFrom: OLD });
    const plain = [task(TODAY, false), task(YESTERDAY, true)];
    expect(undoBulkCarry([lonely])).toEqual([lonely]);
    expect(undoBulkCarry(plain)).toEqual(plain);
  });
});
