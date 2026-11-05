import { useMemo } from 'react';
import { RewardPie } from '../components/RewardPie';
import { Ring } from '../components/Ring';
import { addDays, formatLong } from '../lib/dates';
import { plural } from '../lib/plural';
import { dayStats, historyDays } from '../lib/stats';
import { useStore } from '../store/store';
import type { Category, DateKey } from '../types';

interface Props {
  today: DateKey;
  onOpenDay(date: DateKey): void;
}

export function HistoryScreen({ today, onOpenDay }: Props) {
  const categories = useStore((s) => s.categories);
  const tasks = useStore((s) => s.tasks);

  const days = useMemo(
    () =>
      historyDays(tasks)
        .filter((d) => d <= today)
        .map((date) => ({ date, stats: dayStats(tasks, date) })),
    [tasks, today],
  );
  const byId = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const totalRewards = days.reduce((n, d) => n + d.stats.rewardsOpen, 0);
  const yesterday = addDays(today, -1);

  return (
    <div className="page">
      <header className="day-head">
        <div className="day-head__text">
          <p className="eyebrow">Все дни</p>
          <h1 className="title">История</h1>
        </div>
      </header>

      {days.length === 0 ? (
        <div className="card empty">
          <p className="empty__title">Пока пусто</p>
          <p className="empty__text">Добавляй и отмечай задачи на экране «Сегодня» — здесь появятся прошлые дни и заработанные награды.</p>
        </div>
      ) : (
        <>
          <section className="card hist-stats" aria-label="Итого">
            <div className="summary__stat">
              <span className="label">Дней с задачами</span>
              <span className="summary__num">{days.length}</span>
            </div>
            <div className="summary__stat">
              <span className="label">Наград заработано</span>
              <span className="summary__num">{totalRewards}</span>
            </div>
          </section>

          <ul className="hist-list">
            {days.map(({ date, stats }) => {
              const opened = stats.openCategoryIds
                .map((id) => byId.get(id))
                .filter((c): c is Category => Boolean(c));
              const title = date === today ? 'Сегодня' : date === yesterday ? 'Вчера' : formatLong(date, today);
              const rewards = stats.rewardsOpen
                ? ` · ${stats.rewardsOpen} ${plural(stats.rewardsOpen, ['награда', 'награды', 'наград'])}`
                : '';
              return (
                <li key={date}>
                  <button type="button" className="card hist-row" onClick={() => onOpenDay(date)}>
                    <Ring pct={stats.pct} size={46} color="#E8412C" track="rgba(17,17,17,0.14)" />
                    <span className="hist-row__text">
                      <span className="hist-row__title">{title}</span>
                      <span className="hist-row__sub">
                        {stats.done} из {stats.total} · {stats.pct}%{rewards}
                      </span>
                    </span>
                    {opened.length > 0 && (
                      <span className="hist-row__rewards" aria-hidden="true">
                        {opened.slice(0, 3).map((c) => (
                          <RewardPie key={c.id} reward={c.reward} done={1} total={1} size={34} />
                        ))}
                        {opened.length > 3 && <span className="more-count">+{opened.length - 3}</span>}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
