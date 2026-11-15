import type { Category, DateKey, Task } from '../types';
import { byOrder, nextOrder } from './order';

/** Что предложить перенести на сегодня. */
export interface CarryOffer {
  /** Последний прошлый день, в котором есть задачи. */
  from: DateKey;
  /** Его незакрытые и ещё не перенесённые задачи (без архивных категорий), в порядке показа. */
  tasks: Task[];
  /** Сколько всего задач было в тот день. */
  total: number;
}

/**
 * Смотрим только на последний прошлый день с задачами: старые хвосты не тащим.
 * null — предлагать нечего: всё закрыто, уже перенесено или пользователь сказал «Не нужно».
 */
export function findCarryOffer(
  tasks: Task[],
  categories: Category[],
  today: DateKey,
  dismissedFrom?: DateKey,
): CarryOffer | null {
  let from = '';
  for (const t of tasks) if (t.date < today && t.date > from) from = t.date;
  if (!from || from === dismissedFrom) return null;

  const active = new Set(categories.filter((c) => !c.archived).map((c) => c.id));
  const day = tasks.filter((t) => t.date === from);
  const left = day.filter((t) => !t.done && !t.carriedTo && active.has(t.categoryId)).sort(byOrder);
  return left.length ? { from, tasks: left, total: day.length } : null;
}

/**
 * Копирует задачи предложения на `today` в низ их категорий (в прежнем порядке).
 * Оригиналы остаются в своём дне незакрытыми, с пометкой carriedTo — история не врёт.
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
      carriedFrom: offer.from,
    });
  }
  return result;
}
