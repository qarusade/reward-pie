import type { Tab } from '../types';
import { GiftIcon, HistoryIcon, TodayIcon } from './Icon';

const TABS: { id: Tab; label: string; Icon: typeof TodayIcon }[] = [
  { id: 'today', label: 'Сегодня', Icon: TodayIcon },
  { id: 'history', label: 'История', Icon: HistoryIcon },
  { id: 'rewards', label: 'Награды', Icon: GiftIcon },
];

export function TabBar({ tab, onChange }: { tab: Tab; onChange(tab: Tab): void }) {
  return (
    <nav className="tabbar" aria-label="Разделы">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className="tabbar__btn"
          aria-current={tab === id ? 'page' : undefined}
          onClick={() => onChange(id)}
        >
          <Icon />
          {label}
        </button>
      ))}
    </nav>
  );
}
