import type { Category, DateKey, Task } from '../types';

export interface Progress {
  total: number;
  done: number;
  /** 0–100, округлено */
  pct: number;
  /** Все задачи закрыты (и их больше нуля) — награда открыта. */
  open: boolean;
}

export function progressOf(tasks: Task[]): Progress {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  return {
    total,
    done,
    pct: total ? Math.round((done / total) * 100) : 0,
    open: total > 0 && done === total,
  };
}

export function tasksForDay(tasks: Task[], date: DateKey): Task[] {
  return tasks.filter((t) => t.date === date);
}

/**
 * Категории, которые показываются в конкретном дне: все активные
 * плюс архивные, если у них есть задачи в этот день.
 */
export function categoriesForDay(categories: Category[], dayTasks: Task[]): Category[] {
  const withTasks = new Set(dayTasks.map((t) => t.categoryId));
  return categories
    .filter((c) => !c.archived || withTasks.has(c.id))
    .sort((a, b) => a.createdAt - b.createdAt);
}

export interface DayStats extends Progress {
  /** Сколько категорий закрыты полностью. */
  rewardsOpen: number;
  /** Сколько категорий вообще имели задачи в этот день. */
  rewardsTotal: number;
  /** id категорий с открытой наградой — в порядке появления задач. */
  openCategoryIds: string[];
}

export function dayStats(tasks: Task[], date: DateKey): DayStats {
  const dayTasks = tasksForDay(tasks, date);
  const ids = [...new Set(dayTasks.map((t) => t.categoryId))];
  const openCategoryIds = ids.filter((id) => progressOf(dayTasks.filter((t) => t.categoryId === id)).open);
  return {
    ...progressOf(dayTasks),
    rewardsOpen: openCategoryIds.length,
    rewardsTotal: ids.length,
    openCategoryIds,
  };
}

/** Даты, в которых есть хоть одна задача, от новых к старым. */
export function historyDays(tasks: Task[]): DateKey[] {
  return [...new Set(tasks.map((t) => t.date))].sort().reverse();
}

/** Сколько дней награда категории была открыта целиком. */
export function rewardCount(tasks: Task[], categoryId: string): number {
  const byDay = new Map<DateKey, Task[]>();
  for (const t of tasks) {
    if (t.categoryId !== categoryId) continue;
    const list = byDay.get(t.date) ?? [];
    list.push(t);
    byDay.set(t.date, list);
  }
  let count = 0;
  byDay.forEach((list) => {
    if (progressOf(list).open) count += 1;
  });
  return count;
}

/** Углы для пирога: сколько градусов открыто и ширина одного куска. */
export function pieGeometry(done: number, total: number): { deg: number; slice: number } {
  if (total <= 0) return { deg: 0, slice: 360 };
  const safeDone = Math.min(Math.max(done, 0), total);
  return { deg: (safeDone / total) * 360, slice: 360 / total };
}
