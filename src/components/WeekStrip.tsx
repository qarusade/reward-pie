import { dayOfMonth, formatLong, weekdayShort } from '../lib/dates';
import { tasksWord } from '../lib/plural';
import type { DateKey } from '../types';
import { Ring } from './Ring';

export interface WeekDay {
  key: DateKey;
  pct: number;
  /** Сколько задач в этот день — число внутри кольца. */
  total: number;
  hasTasks: boolean;
  isFuture: boolean;
  isToday: boolean;
  isSelected: boolean;
}

/**
 * Дни недели — кнопки. Пустой день: пунктирное кольцо без числа.
 * День с задачами: сплошное кольцо с прогрессом и числом задач внутри.
 */
export function WeekStrip({ days, today, onSelect }: { days: WeekDay[]; today: DateKey; onSelect(key: DateKey): void }) {
  return (
    <>
      <nav className="week" aria-label="Неделя">
        {days.map((d) => {
          const label =
            formatLong(d.key, today) +
            (d.isToday ? ', сегодня' : '') +
            (d.hasTasks
              ? `, ${d.total} ${tasksWord(d.total)}, выполнено ${d.pct}%`
              : d.isFuture || d.isToday
                ? ', задач нет, можно запланировать'
                : ', задач не было');
          const onDark = d.isSelected;
          const empty = !d.hasTasks;
          const track = onDark
            ? empty
              ? 'rgba(255,255,255,0.6)'
              : 'rgba(255,255,255,0.3)'
            : empty
              ? 'rgba(17,17,17,0.4)'
              : 'rgba(17,17,17,0.14)';
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
              <span className="week__ring">
                <Ring pct={d.pct} color={onDark ? '#FFE14D' : '#E8412C'} track={track} dashedTrack={empty} />
                {!empty && <span className="week__count">{d.total}</span>}
              </span>
              <span className="week__num">{dayOfMonth(d.key)}</span>
            </button>
          );
        })}
      </nav>
      <p className="week__hint">Нажми на день, чтобы открыть его задачи</p>
    </>
  );
}
