import type { Category, DateKey, Task } from '../types';
import { byOrder, nextOrder } from './order';

/** Что предложить перенести на сегодня. */
export interface CarryOffer {
  /** Самый ранний день, из которого есть что перенести. */
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

function carryable(categories: Category[]): (t: Task) => boolean {
  const active = new Set(categories.filter((c) => !c.archived).map((c) => c.id));
  return (t) => !t.done && !t.carriedTo && active.has(t.categoryId);
}

/**
 * Плашка на «Сегодня»: всё незакрытое из ВСЕХ прошлых дней, кроме тех,
 * от которых отказались кнопкой «Не нужно» (дни по `dismissedUpTo` включительно).
 * Архивные категории и уже перенесённые задачи не предлагаются.
 */
export function findCarryOffer(
  tasks: Task[],
  categories: Category[],
  today: DateKey,
  dismissedUpTo?: DateKey,
): CarryOffer | null {
  const ok = carryable(categories);
  return offerOf(tasks.filter((t) => t.date < today && (!dismissedUpTo || t.date > dismissedUpTo) && ok(t)));
}

/** Кнопка на экране прошлого дня: незакрытое только этого дня. «Не нужно» на неё не влияет. */
export function dayCarryOffer(tasks: Task[], categories: Category[], day: DateKey, today: DateKey): CarryOffer | null {
  if (day >= today) return null;
  const ok = carryable(categories);
  return offerOf(tasks.filter((t) => t.date === day && ok(t)));
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
