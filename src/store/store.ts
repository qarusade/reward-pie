import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { defaultCategories } from '../palette';
import { newId } from '../lib/id';
import { moveTask, nextOrder, withOrder } from '../lib/order';
import type { Category, DateKey, Reward, Task } from '../types';
import { appStorage } from './storage';

export interface CategoryInput {
  name: string;
  color: string;
  reward: Reward;
}

interface Data {
  categories: Category[];
  tasks: Task[];
  /** Стартовые категории уже созданы (чтобы не создавать их повторно после удаления). */
  seeded: boolean;
}

interface Actions {
  addCategory(input: CategoryInput): string;
  updateCategory(id: string, patch: Partial<CategoryInput>): void;
  /** С задачами — в архив (история сохраняется), без задач — удаляется насовсем. */
  removeCategory(id: string): void;
  restoreCategory(id: string): void;
  addTask(categoryId: string, date: DateKey, title: string): void;
  toggleTask(id: string): void;
  /** Перетаскивание: ставит задачу на место другой из того же списка (категория + день). */
  moveTask(activeId: string, overId: string): void;
  deleteTask(id: string): void;
  seedIfNeeded(): void;
}

export type StoreState = Data & Actions;

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      categories: [],
      tasks: [],
      seeded: false,

      addCategory(input) {
        const id = newId();
        const category: Category = {
          id,
          name: input.name.trim(),
          color: input.color,
          reward: { ...input.reward, name: input.reward.name.trim() },
          createdAt: Date.now(),
        };
        set((s) => ({ categories: [...s.categories, category] }));
        return id;
      },

      updateCategory(id, patch) {
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id
              ? {
                  ...c,
                  ...patch,
                  name: (patch.name ?? c.name).trim(),
                  reward: patch.reward ? { ...patch.reward, name: patch.reward.name.trim() } : c.reward,
                }
              : c,
          ),
        }));
      },

      removeCategory(id) {
        set((s) =>
          s.tasks.some((t) => t.categoryId === id)
            ? { categories: s.categories.map((c) => (c.id === id ? { ...c, archived: true } : c)) }
            : { categories: s.categories.filter((c) => c.id !== id) },
        );
      },

      restoreCategory(id) {
        set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, archived: false } : c)) }));
      },

      addTask(categoryId, date, title) {
        const clean = title.trim();
        if (!clean) return;
        set((s) => {
          const task: Task = {
            id: newId(),
            categoryId,
            date,
            title: clean,
            done: false,
            createdAt: Date.now(),
            order: nextOrder(s.tasks, categoryId, date),
          };
          return { tasks: [...s.tasks, task] };
        });
      },

      toggleTask(id) {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, done: !t.done, doneAt: t.done ? undefined : Date.now() } : t,
          ),
        }));
      },

      moveTask(activeId, overId) {
        set((s) => {
          const tasks = moveTask(s.tasks, activeId, overId);
          return tasks === s.tasks ? s : { tasks };
        });
      },

      deleteTask(id) {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
      },

      seedIfNeeded() {
        const s = get();
        if (s.seeded) return;
        set({ seeded: true, categories: s.categories.length ? s.categories : defaultCategories() });
      },
    }),
    {
      name: 'reward-pie',
      version: 2,
      storage: createJSONStorage(() => appStorage),
      migrate: (persisted, version) => migrate(persisted, version),
      partialize: (s): Data => ({ categories: s.categories, tasks: s.tasks, seeded: s.seeded }),
      onRehydrateStorage: () => (state) => {
        state?.seedIfNeeded();
      },
    },
  ),
);

/**
 * Переход старых сохранённых данных на текущую схему.
 * v1 → v2: у задач появилось поле `order` (порядок внутри категории за день).
 */
export function migrate(persisted: unknown, version: number): Data {
  const data = (persisted ?? {}) as Partial<Data>;
  let tasks = (data.tasks ?? []) as Task[];
  if (version < 2) tasks = withOrder(tasks);
  return { categories: data.categories ?? [], tasks, seeded: data.seeded ?? false };
}

/** true, когда данные подняты из хранилища — до этого ничего не рисуем, чтобы не мигать пустотой. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useStore.persist.hasHydrated());
  useEffect(() => {
    const unsub = useStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useStore.persist.hasHydrated());
    return unsub;
  }, []);
  return hydrated;
}
