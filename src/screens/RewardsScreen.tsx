import type { CSSProperties } from 'react';
import { PlusIcon } from '../components/Icon';
import { RewardPie } from '../components/RewardPie';
import { timesWord } from '../lib/plural';
import { rewardCount } from '../lib/stats';
import { useStore } from '../store/store';
import type { Category } from '../types';

interface Props {
  onEdit(id: string): void;
  onCreate(): void;
}

export function RewardsScreen({ onEdit, onCreate }: Props) {
  const categories = useStore((s) => s.categories);
  const tasks = useStore((s) => s.tasks);
  const restoreCategory = useStore((s) => s.restoreCategory);

  const byCreated = (a: Category, b: Category) => a.createdAt - b.createdAt;
  const active = categories.filter((c) => !c.archived).sort(byCreated);
  const archived = categories.filter((c) => c.archived).sort(byCreated);

  return (
    <div className="page">
      <header className="day-head">
        <div className="day-head__text">
          <p className="eyebrow">Категории</p>
          <h1 className="title">Награды</h1>
        </div>
      </header>
      <p className="intro">
        У каждой категории своя награда. Закрой за день все задачи категории — и картинка откроется целиком.
      </p>

      <ul className="reward-list">
        {active.map((c) => {
          const n = rewardCount(tasks, c.id);
          return (
            <li key={c.id} className="card reward-row" style={{ '--cat': c.color } as CSSProperties}>
              <RewardPie reward={c.reward} done={1} total={1} size={76} />
              <div className="reward-row__text">
                <span className="cat__name-row">
                  <span className="dot" aria-hidden="true" />
                  <span className="reward-row__cat">{c.name}</span>
                </span>
                <span className="cat__reward">{c.reward.name}</span>
                <span className="reward-row__count">{n ? `Заработано ${n} ${timesWord(n)}` : 'Ещё не открывалась'}</span>
              </div>
              <button type="button" className="btn" aria-label={`Изменить категорию «${c.name}»`} onClick={() => onEdit(c.id)}>
                Изменить
              </button>
            </li>
          );
        })}
      </ul>

      <button type="button" className="new-cat" onClick={onCreate}>
        <PlusIcon /> Новая категория
      </button>

      {archived.length > 0 && (
        <section className="page" aria-labelledby="archived-title">
          <h2 id="archived-title" className="section-title">
            В архиве
          </h2>
          <ul className="reward-list">
            {archived.map((c) => {
              const n = rewardCount(tasks, c.id);
              return (
                <li key={c.id} className="card reward-row reward-row--archived" style={{ '--cat': c.color } as CSSProperties}>
                  <RewardPie reward={c.reward} done={1} total={1} size={56} />
                  <div className="reward-row__text">
                    <span className="reward-row__cat">{c.name}</span>
                    <span className="reward-row__count">
                      {c.reward.name}
                      {n ? ` · ${n} ${timesWord(n)}` : ''}
                    </span>
                  </div>
                  <button type="button" className="btn" aria-label={`Вернуть категорию «${c.name}»`} onClick={() => restoreCategory(c.id)}>
                    Вернуть
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
