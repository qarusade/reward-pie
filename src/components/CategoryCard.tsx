import { useId, useState, type CSSProperties, type FormEvent } from 'react';
import { tasksWord } from '../lib/plural';
import { progressOf } from '../lib/stats';
import { useStore } from '../store/store';
import type { Category, DateKey, Task } from '../types';
import { CheckIcon, MoreIcon, PlusIcon, TrashIcon } from './Icon';
import { RewardPie } from './RewardPie';

interface Props {
  category: Category;
  /** Задачи этой категории за выбранный день. */
  tasks: Task[];
  date: DateKey;
  onEdit(categoryId: string): void;
}

export function CategoryCard({ category, tasks, date, onEdit }: Props) {
  const toggleTask = useStore((s) => s.toggleTask);
  const deleteTask = useStore((s) => s.deleteTask);
  const headingId = useId();
  const p = progressOf(tasks);
  const left = p.total - p.done;
  const status =
    p.total === 0
      ? 'Добавь задачи — и награда начнёт открываться'
      : `${p.done} из ${p.total} · ещё ${left} ${tasksWord(left)}`;

  return (
    <section className="card cat" style={{ '--cat': category.color } as CSSProperties} aria-labelledby={headingId}>
      <div className="cat__head">
        <RewardPie
          reward={category.reward}
          done={p.done}
          total={p.total}
          size={104}
          label={`${category.reward.name}: открыто ${p.pct}%, ${p.done} из ${p.total}`}
        />
        <div className="cat__info">
          <div className="cat__name-row">
            <span className="dot" aria-hidden="true" />
            <h2 id={headingId} className="cat__name">
              {category.name}
            </h2>
            {!category.archived && (
              <button
                type="button"
                className="icon-btn cat__more"
                aria-label={`Настроить категорию «${category.name}»`}
                onClick={() => onEdit(category.id)}
              >
                <MoreIcon />
              </button>
            )}
          </div>
          <span className="label">Награда</span>
          <span className="cat__reward">{category.reward.name}</span>
          {p.open ? <span className="badge">Открыта — заслужил</span> : <span className="cat__status">{status}</span>}
          {category.archived && <span className="cat__status cat__status--muted">Категория в архиве</span>}
        </div>
      </div>

      {tasks.length > 0 && (
        <ul className="tasks">
          {tasks.map((t) => (
            <li key={t.id} className="task">
              <button type="button" className="task__toggle" aria-pressed={t.done} onClick={() => toggleTask(t.id)}>
                <span className="task__box">{t.done && <CheckIcon />}</span>
                <span className="task__title">{t.title}</span>
              </button>
              <button
                type="button"
                className="icon-btn task__delete"
                aria-label={`Удалить задачу «${t.title}»`}
                onClick={() => {
                  if (window.confirm(`Удалить задачу «${t.title}»?`)) deleteTask(t.id);
                }}
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!category.archived && <AddTaskForm category={category} date={date} />}
    </section>
  );
}

function AddTaskForm({ category, date }: { category: Category; date: DateKey }) {
  const addTask = useStore((s) => s.addTask);
  const [text, setText] = useState('');
  const inputId = useId();
  const label = `Новая задача в категории «${category.name}»`;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    addTask(category.id, date, text);
    setText('');
  }

  return (
    <form className="add" onSubmit={submit}>
      <label className="sr-only" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className="add__input"
        type="text"
        placeholder="Новая задача…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        enterKeyHint="done"
        autoComplete="off"
        maxLength={200}
      />
      <button type="submit" className="add__btn" aria-label={`Добавить задачу в «${category.name}»`} disabled={!text.trim()}>
        <PlusIcon />
      </button>
    </form>
  );
}
