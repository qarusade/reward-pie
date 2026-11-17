import { beforeEach, describe, expect, it } from 'vitest';
import { migrate, useStore } from './store';

const reset = () =>
  useStore.setState({ categories: [], tasks: [], seeded: false, carryDismissedFrom: undefined, carryRepaired: undefined });

describe('store', () => {
  beforeEach(reset);

  it('первый запуск создаёт стартовые категории ровно один раз', () => {
    useStore.getState().seedIfNeeded();
    expect(useStore.getState().categories.map((c) => c.name)).toEqual(['Работа', 'Менторство', 'Здоровье']);
    useStore.getState().removeCategory('work');
    useStore.getState().seedIfNeeded();
    expect(useStore.getState().categories).toHaveLength(2);
  });

  it('добавляет задачу, обрезая пробелы, и игнорирует пустую', () => {
    const { addCategory, addTask } = useStore.getState();
    const id = addCategory({ name: ' Английский ', color: '#3D6BFF', reward: { kind: 'sweet', name: 'Торт' } });
    addTask(id, '2026-11-05', '  Слова  ');
    addTask(id, '2026-11-05', '   ');
    const s = useStore.getState();
    expect(s.categories[0].name).toBe('Английский');
    expect(s.tasks).toHaveLength(1);
    expect(s.tasks[0]).toMatchObject({ categoryId: id, date: '2026-11-05', title: 'Слова', done: false });
  });

  it('переключает задачу и ставит время выполнения', () => {
    const { addCategory, addTask } = useStore.getState();
    const id = addCategory({ name: 'A', color: '#000', reward: { kind: 'pizza', name: 'Пицца' } });
    addTask(id, '2026-11-05', 'x');
    const taskId = useStore.getState().tasks[0].id;
    useStore.getState().toggleTask(taskId);
    expect(useStore.getState().tasks[0].done).toBe(true);
    expect(useStore.getState().tasks[0].doneAt).toBeTypeOf('number');
    useStore.getState().toggleTask(taskId);
    expect(useStore.getState().tasks[0]).toMatchObject({ done: false, doneAt: undefined });
  });

  it('категорию с задачами архивирует, без задач — удаляет', () => {
    const { addCategory, addTask } = useStore.getState();
    const withTasks = addCategory({ name: 'A', color: '#000', reward: { kind: 'pizza', name: 'Пицца' } });
    const empty = addCategory({ name: 'B', color: '#000', reward: { kind: 'game', name: 'Игры' } });
    addTask(withTasks, '2026-11-05', 'x');
    useStore.getState().removeCategory(withTasks);
    useStore.getState().removeCategory(empty);
    const s = useStore.getState();
    expect(s.categories).toHaveLength(1);
    expect(s.categories[0]).toMatchObject({ id: withTasks, archived: true });
    expect(s.tasks).toHaveLength(1);
  });

  it('задачи переставляются внутри своей категории, новая встаёт вниз', () => {
    const { addCategory, addTask } = useStore.getState();
    const id = addCategory({ name: 'A', color: '#000', reward: { kind: 'pizza', name: 'Пицца' } });
    for (const title of ['первая', 'вторая', 'третья']) addTask(id, '2026-11-05', title);
    const [first, , third] = useStore.getState().tasks;
    useStore.getState().moveTask(third.id, first.id);
    addTask(id, '2026-11-05', 'четвёртая');
    const titles = [...useStore.getState().tasks].sort((a, b) => a.order - b.order).map((t) => t.title);
    expect(titles).toEqual(['третья', 'первая', 'вторая', 'четвёртая']);
  });

  it('миграция v1 → v2 сохраняет задачи и даёт им порядок', () => {
    const v1 = {
      categories: [{ id: 'work', name: 'Работа', color: '#000', reward: { kind: 'pizza', name: 'Пицца' }, createdAt: 1 }],
      tasks: [
        { id: 'b', categoryId: 'work', date: '2026-11-05', title: 'b', done: true, createdAt: 20, doneAt: 25 },
        { id: 'a', categoryId: 'work', date: '2026-11-05', title: 'a', done: false, createdAt: 10 },
      ],
      seeded: true,
    };
    const v2 = migrate(v1, 1);
    expect(v2.seeded).toBe(true);
    expect(v2.categories).toEqual(v1.categories);
    expect(v2.tasks).toEqual([
      { ...v1.tasks[0], order: 1 },
      { ...v1.tasks[1], order: 0 },
    ]);
  });

  it('переносит вчерашние незакрытые на сегодня один раз, «Не нужно» прячет предложение', () => {
    const { addCategory, addTask } = useStore.getState();
    const id = addCategory({ name: 'A', color: '#000', reward: { kind: 'pizza', name: 'Пицца' } });
    addTask(id, '2026-11-05', 'хвост');
    addTask(id, '2026-11-05', 'сделано');
    useStore.getState().toggleTask(useStore.getState().tasks[1].id);

    useStore.getState().carryOver('2026-11-06');
    useStore.getState().carryOver('2026-11-06');
    const today = useStore.getState().tasks.filter((t) => t.date === '2026-11-06');
    expect(today.map((t) => [t.title, t.done, t.carriedFrom])).toEqual([['хвост', false, '2026-11-05']]);

    addTask(id, '2026-11-06', 'не успел');
    useStore.getState().dismissCarry('2026-11-06');
    useStore.getState().carryOver('2026-11-07');
    expect(useStore.getState().tasks.filter((t) => t.date === '2026-11-07')).toHaveLength(0);
  });

  it('перенос с конкретного прошлого дня работает и после «Не нужно»', () => {
    const { addCategory, addTask } = useStore.getState();
    const id = addCategory({ name: 'A', color: '#000', reward: { kind: 'pizza', name: 'Пицца' } });
    addTask(id, '2026-11-05', 'старый хвост');
    addTask(id, '2026-11-10', 'закрыто');
    useStore.getState().toggleTask(useStore.getState().tasks[1].id);
    useStore.getState().dismissCarry('2026-11-10');
    useStore.getState().dismissCarry('2026-11-01');
    expect(useStore.getState().carryDismissedFrom).toBe('2026-11-10');

    useStore.getState().carryOver('2026-11-16');
    expect(useStore.getState().tasks.filter((t) => t.date === '2026-11-16')).toHaveLength(0);

    useStore.getState().carryDay('2026-11-05', '2026-11-16');
    const today = useStore.getState().tasks.filter((t) => t.date === '2026-11-16');
    expect(today.map((t) => [t.title, t.carriedFrom])).toEqual([['старый хвост', '2026-11-05']]);
  });

  it('задача переносится по одной, удаление копии возвращает её в свой день', () => {
    const { addCategory, addTask } = useStore.getState();
    const id = addCategory({ name: 'A', color: '#000', reward: { kind: 'pizza', name: 'Пицца' } });
    addTask(id, '2026-11-05', 'старая');
    const original = useStore.getState().tasks[0];
    useStore.getState().carryTask(original.id, '2026-11-18');
    useStore.getState().carryTask(original.id, '2026-11-18');
    const copies = useStore.getState().tasks.filter((t) => t.date === '2026-11-18');
    expect(copies.map((t) => [t.title, t.carriedFrom])).toEqual([['старая', '2026-11-05']]);

    useStore.getState().deleteTask(copies[0].id);
    expect(useStore.getState().tasks).toHaveLength(1);
    expect(useStore.getState().tasks[0].carriedTo).toBeUndefined();
  });

  it('ремонт массового переноса выполняется один раз', () => {
    useStore.setState({
      categories: [{ id: 'w', name: 'W', color: '#000', reward: { kind: 'pizza', name: 'Пицца' }, createdAt: 0 }],
      tasks: [
        { id: 'o', categoryId: 'w', date: '2026-11-05', title: 'x', done: false, createdAt: 1, order: 0, carriedTo: '2026-11-18' },
        { id: 'c', categoryId: 'w', date: '2026-11-18', title: 'x', done: false, createdAt: 2, order: 0, carriedFrom: '2026-11-05' },
      ],
    });
    useStore.getState().repairCarryIfNeeded();
    expect(useStore.getState().tasks.map((t) => [t.id, t.carriedTo])).toEqual([['o', undefined]]);
    expect(useStore.getState().carryRepaired).toBe(true);

    // после ремонта ручной перенос старой задачи не откатывается
    useStore.getState().carryTask('o', '2026-11-18');
    useStore.getState().repairCarryIfNeeded();
    expect(useStore.getState().tasks).toHaveLength(2);
  });

  it('данные без новых полей читаются как есть, версия не меняется', () => {
    const v2 = {
      categories: [],
      tasks: [{ id: 'a', categoryId: 'work', date: '2026-11-05', title: 'a', done: false, createdAt: 1, order: 0 }],
      seeded: true,
    };
    expect(migrate(v2, 2)).toEqual({ ...v2, carryDismissedFrom: undefined, carryRepaired: undefined });
    expect(useStore.persist.getOptions().version).toBe(2);
  });
});
