import { describe, expect, it } from 'vitest';
import type { Task } from '../types';
import { moveTask, nextOrder, sortTasks, withOrder } from './order';

const task = (id: string, order: number, extra: Partial<Task> = {}): Task => ({
  id,
  categoryId: 'work',
  date: '2026-11-05',
  title: id,
  done: false,
  createdAt: 0,
  order,
  ...extra,
});

const ids = (tasks: Task[]) => sortTasks(tasks).map((t) => t.id);

describe('порядок задач', () => {
  it('сортирует по order, при равенстве — по времени создания', () => {
    const tasks = [task('b', 1), task('c', 0, { createdAt: 5 }), task('a', 0, { createdAt: 1 })];
    expect(ids(tasks)).toEqual(['a', 'c', 'b']);
  });

  it('новая задача встаёт в низ своего списка, а не чужого', () => {
    const tasks = [
      task('a', 0),
      task('b', 7),
      task('x', 40, { categoryId: 'health' }),
      task('y', 30, { date: '2026-11-04' }),
    ];
    expect(nextOrder(tasks, 'work', '2026-11-05')).toBe(8);
    expect(nextOrder(tasks, 'mentor', '2026-11-05')).toBe(0);
  });

  it('перетаскивание вниз и вверх ставит задачу на место другой', () => {
    const tasks = [task('a', 0), task('b', 1), task('c', 2), task('d', 3)];
    const down = moveTask(tasks, 'a', 'c');
    expect(ids(down)).toEqual(['b', 'c', 'a', 'd']);
    expect(sortTasks(down).map((t) => t.order)).toEqual([0, 1, 2, 3]);
    expect(ids(moveTask(down, 'd', 'b'))).toEqual(['d', 'b', 'c', 'a']);
  });

  it('не трогает другие категории и дни и не двигает между ними', () => {
    const other = task('z', 0, { categoryId: 'health' });
    const yesterday = task('y', 0, { date: '2026-11-04' });
    const tasks = [task('a', 0), task('b', 1), other, yesterday];
    const moved = moveTask(tasks, 'b', 'a');
    expect(moved.find((t) => t.id === 'z')).toBe(other);
    expect(moved.find((t) => t.id === 'y')).toBe(yesterday);
    expect(moveTask(tasks, 'a', 'z')).toBe(tasks);
    expect(moveTask(tasks, 'a', 'y')).toBe(tasks);
    expect(moveTask(tasks, 'a', 'a')).toBe(tasks);
    expect(moveTask(tasks, 'a', 'нет такой')).toBe(tasks);
  });

  it('старые задачи без order нумеруются по времени создания внутри своего списка', () => {
    const old = [
      { id: 'b', categoryId: 'work', date: '2026-11-05', title: 'b', done: false, createdAt: 20 },
      { id: 'h', categoryId: 'health', date: '2026-11-05', title: 'h', done: true, createdAt: 15 },
      { id: 'a', categoryId: 'work', date: '2026-11-05', title: 'a', done: false, createdAt: 10 },
      { id: 'c', categoryId: 'work', date: '2026-11-04', title: 'c', done: false, createdAt: 30 },
    ];
    const result = withOrder(old);
    expect(result.map((t) => [t.id, t.order])).toEqual([
      ['b', 1],
      ['h', 0],
      ['a', 0],
      ['c', 0],
    ]);
  });
});
