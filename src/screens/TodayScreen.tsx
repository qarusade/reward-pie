import { useMemo } from 'react';
import { CategoryCard } from '../components/CategoryCard';
import { PlusIcon } from '../components/Icon';
import { WeekStrip } from '../components/WeekStrip';
import { dayTitle, formatLong, weekDays } from '../lib/dates';
import { byOrder } from '../lib/order';
import { categoriesForDay, dayStats, tasksForDay } from '../lib/stats';
import { useStore } from '../store/store';
import type { DateKey } from '../types';

interface Props {
  date: DateKey;
  today: DateKey;
  onSelectDate(date: DateKey): void;
  onEditCategory(id: string): void;
  onCreateCategory(): void;
}

export function TodayScreen({ date, today, onSelectDate, onEditCategory, onCreateCategory }: Props) {
  const categories = useStore((s) => s.categories);
  const tasks = useStore((s) => s.tasks);

  const dayTasks = useMemo(() => tasksForDay(tasks, date).sort(byOrder), [tasks, date]);
  const cats = useMemo(() => categoriesForDay(categories, dayTasks), [categories, dayTasks]);
  const stats = useMemo(() => dayStats(tasks, date), [tasks, date]);
  const week = useMemo(
    () =>
      weekDays(date).map((key) => {
        const s = dayStats(tasks, key);
        return {
          key,
          pct: s.pct,
          hasTasks: s.total > 0,
          isFuture: key > today,
          isToday: key === today,
          isSelected: key === date,
        };
      }),
    [tasks, date, today],
  );

  return (
    <div className="page">
      <div className="today-top">
        <header className="day-head">
          <div className="day-head__text">
            <p className="eyebrow">{formatLong(date, today)}</p>
            <h1 className="title">{dayTitle(date, today)}</h1>
          </div>
          {date !== today && (
            <button type="button" className="btn" onClick={() => onSelectDate(today)}>
              К сегодня
            </button>
          )}
        </header>

        <section className="card summary" aria-label="Итог дня">
          <div className="summary__row">
            <div className="summary__stat">
              <span className="label">Итог дня</span>
              <div className="summary__line">
                <span className="summary__num">
                  {stats.done} из {stats.total}
                </span>
                <span className="pill">{stats.pct}%</span>
              </div>
            </div>
            <div className="summary__stat summary__stat--end">
              <span className="label">Открыто наград</span>
              <span className="summary__num">
                {stats.rewardsOpen}/{cats.length}
              </span>
            </div>
          </div>
          <WeekStrip days={week} today={today} onSelect={onSelectDate} />
        </section>
      </div>

      {cats.length === 0 ? (
        <div className="card empty">
          <p className="empty__title">Пока нет ни одной категории</p>
          <p className="empty__text">Создай категорию, выбери для неё награду — и добавляй задачи.</p>
        </div>
      ) : (
        <div className="cards">
          {cats.map((c) => (
            <CategoryCard
              key={c.id}
              category={c}
              tasks={dayTasks.filter((t) => t.categoryId === c.id)}
              date={date}
              onEdit={onEditCategory}
            />
          ))}
        </div>
      )}

      <button type="button" className="new-cat" onClick={onCreateCategory}>
        <PlusIcon /> Новая категория
      </button>
    </div>
  );
}
