import { beforeEach, describe, expect, it } from 'vitest';
import { useStore } from './store';

const reset = () => useStore.setState({ categories: [], tasks: [], seeded: false });

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
});
