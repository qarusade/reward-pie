import { dayOfMonth, formatLong, weekdayShort } from '../lib/dates';
import type { DateKey } from '../types';
import { Ring } from './Ring';

export interface WeekDay {
  key: DateKey;
  pct: number;
  hasTasks: boolean;
  isFuture: boolean;
  isToday: boolean;
  isSelected: boolean;
}

export function WeekStrip({ days, today, onSelect }: { days: WeekDay[]; today: DateKey; onSelect(key: DateKey): void }) {
  return (
    <nav className="week" aria-label="Неделя">
      {days.map((d) => {
        const label =
          formatLong(d.key, today) +
          (d.isToday ? ', сегодня' : '') +
          (d.hasTasks ? `, выполнено ${d.pct}%` : d.isFuture ? ', запланировать' : ', задач не было');
        const onDark = d.isSelected;
        return (
          <button
            key={d.key}
            type="button"
            className={`week__day${d.isToday ? ' week__day--today' : ''}`}
            aria-pressed={d.isSelected}
            aria-label={label}
            onClick={() => onSelect(d.key)}
          >
            <span className="week__wd">{weekdayShort(d.key)}</span>
            <Ring
              pct={d.hasTasks ? d.pct : 0}
              color={onDark ? '#FFE14D' : '#E8412C'}
              track={onDark ? 'rgba(255,255,255,0.3)' : d.isFuture && !d.hasTasks ? 'rgba(17,17,17,0.4)' : 'rgba(17,17,17,0.14)'}
              dashedTrack={d.isFuture && !d.hasTasks}
            />
            <span className="week__num">{dayOfMonth(d.key)}</span>
          </button>
        );
      })}
    </nav>
  );
}
