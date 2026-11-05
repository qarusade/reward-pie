import type { Task } from '../types';

/** Порядок показа задач: по `order`, при равенстве — кто раньше создан. */
export function byOrder(a: Task, b: Task): number {
  return a.order - b.order || a.createdAt - b.createdAt;
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort(byOrder);
}

const sameList = (a: Task, b: Task) => a.categoryId === b.categoryId && a.date === b.date;

/** `order` для новой задачи: в самый низ списка её категории за этот день. */
export function nextOrder(tasks: Task[], categoryId: string, date: string): number {
  let max = -1;
  for (const t of tasks) if (t.categoryId === categoryId && t.date === date && t.order > max) max = t.order;
  return max + 1;
}

/**
 * Ставит задачу `activeId` на место задачи `overId` (как при перетаскивании)
 * и перенумеровывает список 0..n-1. Двигать можно только внутри одной
 * категории и одного дня; иначе задачи возвращаются без изменений.
 */
export function moveTask(tasks: Task[], activeId: string, overId: string): Task[] {
  if (activeId === overId) return tasks;
  const active = tasks.find((t) => t.id === activeId);
  const over = tasks.find((t) => t.id === overId);
  if (!active || !over || !sameList(active, over)) return tasks;

  const list = tasks.filter((t) => sameList(t, active)).sort(byOrder);
  const from = list.findIndex((t) => t.id === activeId);
  const to = list.findIndex((t) => t.id === overId);
  list.splice(to, 0, ...list.splice(from, 1));

  const newOrder = new Map(list.map((t, i) => [t.id, i]));
  return tasks.map((t) => {
    const order = newOrder.get(t.id);
    return order === undefined || order === t.order ? t : { ...t, order };
  });
}

/** Для старых данных без `order`: нумерует каждый список по времени создания. */
export function withOrder(tasks: Omit<Task, 'order'>[]): Task[] {
  const counters = new Map<string, number>();
  const sorted = [...tasks].sort((a, b) => a.createdAt - b.createdAt);
  const orders = new Map<string, number>();
  for (const t of sorted) {
    const key = `${t.date}|${t.categoryId}`;
    const n = counters.get(key) ?? 0;
    orders.set(t.id, n);
    counters.set(key, n + 1);
  }
  return tasks.map((t) => ({ ...t, order: orders.get(t.id) ?? 0 }));
}
