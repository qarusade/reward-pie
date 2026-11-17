import { useId, type CSSProperties } from 'react';
import type { CarryOffer } from '../lib/carry';
import { addDays, formatLong } from '../lib/dates';
import { tasksWord } from '../lib/plural';
import type { Category, DateKey } from '../types';

const SHOWN = 4;

interface Props {
  offer: CarryOffer;
  today: DateKey;
  categories: Category[];
  onCarry(): void;
  /** Только на «Сегодня»: «Не нужно». На экране прошлого дня кнопки нет. */
  onDismiss?(): void;
  /** Экран прошлого дня: задачи и так видны ниже, список не дублируем. */
  compact?: boolean;
}

/** Откуда задачи: «Вчера» или «Среда, 11 ноября». */
function whenLabel(offer: CarryOffer, today: DateKey): string {
  return offer.from === addDays(today, -1) ? 'Вчера' : formatLong(offer.from, today);
}

/** Плашка «Не закрыто: N задач — Перенести на сегодня». */
export function CarryBanner({ offer, today, categories, onCarry, onDismiss, compact = false }: Props) {
  const headingId = useId();
  const color = new Map(categories.map((c) => [c.id, c.color]));
  const left = offer.tasks.length;

  return (
    <section className={`card carry${compact ? ' carry--compact' : ''}`} aria-labelledby={headingId}>
      <div className="carry__text">
        {!compact && <p className="eyebrow">{whenLabel(offer, today)}</p>}
        <h2 id={headingId} className="carry__title">
          Не закрыто: {left} {tasksWord(left)}
        </h2>
        {compact && left > 1 && <p className="carry__hint">Или по одной — стрелкой у задачи</p>}
        {!compact && (
          <ul className="carry__list">
            {offer.tasks.slice(0, SHOWN).map((t) => (
              <li key={t.id} style={{ '--cat': color.get(t.categoryId) } as CSSProperties}>
                <span className="dot" aria-hidden="true" />
                <span>{t.title}</span>
              </li>
            ))}
            {left > SHOWN && <li className="carry__more">и ещё {left - SHOWN}</li>}
          </ul>
        )}
      </div>
      <div className="carry__actions">
        <button type="button" className="btn btn--primary" onClick={onCarry}>
          {compact && left > 1 ? 'Перенести все на сегодня' : 'Перенести на сегодня'}
        </button>
        {onDismiss && (
          <button type="button" className="btn" onClick={onDismiss}>
            Не нужно
          </button>
        )}
      </div>
    </section>
  );
}
