import type { Category, DateKey, Task } from '../types';
import { addDays } from './dates';
import { byOrder, nextOrder } from './order';

/** Что перенести на сегодня. */
export interface CarryOffer {
  /** Самый ранний день, из которого берутся задачи. */
  from: DateKey;
  /** Самый поздний такой день. Совпадает с `from`, если день один. */
  to: DateKey;
  /** Незакрытые и ещё не перенесённые задачи: по дням от старых к новым, внутри дня — в порядке показа. */
  tasks: Task[];
}

const byDateThenOrder = (a: Task, b: Task) => (a.date < b.date ? -1 : a.date > b.date ? 1 : byOrder(a, b));

function offerOf(tasks: Task[]): CarryOffer | null {
  if (!tasks.length) return null;
  const sorted = [...tasks].sort(byDateThenOrder);
  return { from: sorted[0].date, to: sorted[sorted.length - 1].date, tasks: sorted };
}

/** Задачу можно перенести: не закрыта, ещё не переносилась, категория не в архиве. */
export function canCarry(task: Task, categories: Category[]): boolean {
  if (task.done || task.carriedTo) return false;
  const cat = categories.find((c) => c.id === task.categoryId);
  return !!cat && !cat.archived;
}

/**
 * Плашка на «Сегодня»: незакрытое ТОЛЬКО за вчера (решение Эмина 2026-11-18).
 * Более старые задачи переносятся кнопкой у самой задачи или кнопкой на экране своего дня.
 * После «Не нужно» (`dismissedUpTo` = вчера) плашка до завтра не появляется.
 */
export function findCarryOffer(
  tasks: Task[],
  categories: Category[],
  today: DateKey,
  dismissedUpTo?: DateKey,
): CarryOffer | null {
  const yesterday = addDays(today, -1);
  if (dismissedUpTo && dismissedUpTo >= yesterday) return null;
  return offerOf(tasks.filter((t) => t.date === yesterday && canCarry(t, categories)));
}

/** Кнопка «Перенести все на сегодня» на экране прошлого дня: незакрытое только этого дня. */
export function dayCarryOffer(tasks: Task[], categories: Category[], day: DateKey, today: DateKey): CarryOffer | null {
  if (day >= today) return null;
  return offerOf(tasks.filter((t) => t.date === day && canCarry(t, categories)));
}

/** Кнопка у одной задачи прошлого дня. */
export function taskCarryOffer(tasks: Task[], categories: Category[], id: string, today: DateKey): CarryOffer | null {
  const task = tasks.find((t) => t.id === id);
  return task && task.date < today && canCarry(task, categories) ? offerOf([task]) : null;
}

/**
 * Копирует задачи предложения на `today` в низ их категорий (в том же порядке).
 * Оригиналы остаются в своих днях незакрытыми, с пометкой carriedTo, — история не врёт.
 */
export function applyCarry(tasks: Task[], offer: CarryOffer, today: DateKey, makeId: () => string, now: number): Task[] {
  const ids = new Set(offer.tasks.map((t) => t.id));
  const result = tasks.map((t) => (ids.has(t.id) ? { ...t, carriedTo: today } : t));
  for (const t of offer.tasks) {
    result.push({
      id: makeId(),
      categoryId: t.categoryId,
      date: today,
      title: t.title,
      done: false,
      createdAt: now,
      order: nextOrder(result, t.categoryId, today),
      carriedFrom: t.date,
    });
  }
  return result;
}

/** Оригинал перенесённой копии: тот же текст и категория, в дне-источнике, с пометкой «перенесена» на день копии. */
function originalOf(tasks: Task[], copy: Task, taken: Set<string>): Task | undefined {
  return tasks.find(
    (t) =>
      !taken.has(t.id) &&
      t.date === copy.carriedFrom &&
      t.carriedTo === copy.date &&
      t.categoryId === copy.categoryId &&
      t.title === copy.title,
  );
}

const withoutCarriedTo = ({ carriedTo: _drop, ...rest }: Task): Task => rest;

/**
 * Удаление задачи. Если это перенесённая копия — оригиналу снимаем пометку «перенесена»,
 * чтобы его снова можно было перенести. Так удаление копии работает как «отменить перенос».
 */
export function deleteWithUncarry(tasks: Task[], id: string): Task[] {
  const copy = tasks.find((t) => t.id === id);
  if (!copy) return tasks;
  const original = copy.carriedFrom ? originalOf(tasks, copy, new Set()) : undefined;
  return tasks.filter((t) => t.id !== id).map((t) => (t === original ? withoutCarriedTo(t) : t));
}

/**
 * Разовый ремонт после плашки 16–18 ноября 2026, которая переносила всё из всех прошлых дней.
 * Убираем незакрытые копии, пришедшие НЕ со вчерашнего для них дня, и возвращаем оригиналы
 * (их снова можно перенести кнопкой у задачи). Закрытые копии — уже сделанная работа, их не трогаем.
 * Заодно снимаем пометку «перенесена на …» с оригиналов, чью копию пользователь удалил сам.
 */
export function undoBulkCarry(tasks: Task[]): Task[] {
  const taken = new Set<string>();
  const removeIds = new Set<string>();
  for (const t of tasks) {
    if (!t.carriedFrom || t.done || t.carriedTo || t.carriedFrom >= addDays(t.date, -1)) continue;
    const original = originalOf(tasks, t, taken);
    if (!original) continue; // без оригинала копия — единственная запись о задаче, не удаляем
    taken.add(original.id);
    removeIds.add(t.id);
  }
  const kept = tasks.filter((t) => !removeIds.has(t.id));

  // Оригиналы, у которых на «перенесённый» день нет копии (её удалили или убрали выше).
  const copies = new Set(kept.filter((t) => t.carriedFrom).map((t) => `${t.date}|${t.carriedFrom}|${t.categoryId}|${t.title}`));
  return kept.map((t) =>
    t.carriedTo && !copies.has(`${t.carriedTo}|${t.date}|${t.categoryId}|${t.title}`) ? withoutCarriedTo(t) : t,
  );
}
