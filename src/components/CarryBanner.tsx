import { useId, type CSSProperties } from 'react';
import type { CarryOffer } from '../lib/carry';
import { addDays, formatLong } from '../lib/dates';
import { useStore } from '../store/store';
import type { Category, DateKey } from '../types';

const SHOWN = 4;

/** Плашка на «Сегодня»: незакрытые задачи прошлого дня можно одним нажатием перенести сюда. */
export function CarryBanner({ offer, today, categories }: { offer: CarryOffer; today: DateKey; categories: Category[] }) {
  const carryOver = useStore((s) => s.carryOver);
  const dismissCarry = useStore((s) => s.dismissCarry);
  const headingId = useId();
  const color = new Map(categories.map((c) => [c.id, c.color]));
  const left = offer.tasks.length;
  const when = offer.from === addDays(today, -1) ? 'Вчера' : formatLong(offer.from, today);

  return (
    <section className="card carry" aria-labelledby={headingId}>
      <div className="carry__text">
        <p className="eyebrow">{when}</p>
        <h2 id={headingId} className="carry__title">
          Не закрыто: {left} из {offer.total}
        </h2>
        <ul className="carry__list">
          {offer.tasks.slice(0, SHOWN).map((t) => (
            <li key={t.id} style={{ '--cat': color.get(t.categoryId) } as CSSProperties}>
              <span className="dot" aria-hidden="true" />
              {t.title}
            </li>
          ))}
          {left > SHOWN && <li className="carry__more">и ещё {left - SHOWN}</li>}
        </ul>
      </div>
      <div className="carry__actions">
        <button type="button" className="btn btn--primary" onClick={() => carryOver(today)}>
          Перенести на сегодня
        </button>
        <button type="button" className="btn" onClick={() => dismissCarry(offer.from)}>
          Не нужно
        </button>
      </div>
    </section>
  );
}
