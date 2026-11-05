import { useEffect, useRef, useState } from 'react';
import { CategorySheet } from './components/CategorySheet';
import { TabBar } from './components/TabBar';
import { useToday } from './lib/useToday';
import { HistoryScreen } from './screens/HistoryScreen';
import { RewardsScreen } from './screens/RewardsScreen';
import { TodayScreen } from './screens/TodayScreen';
import { requestPersistentStorage } from './store/storage';
import { useHydrated } from './store/store';
import type { DateKey, Tab } from './types';

/** Что открыто в листе категории: null — ничего, { id: null } — создание. */
type SheetState = { id: string | null } | null;

export function App() {
  const hydrated = useHydrated();
  const today = useToday();
  const [tab, setTab] = useState<Tab>('today');
  const [date, setDate] = useState<DateKey>(today);
  const [sheet, setSheet] = useState<SheetState>(null);

  // После полуночи: если смотрели «сегодня», переезжаем на новый день.
  const prevToday = useRef(today);
  useEffect(() => {
    if (prevToday.current === today) return;
    const old = prevToday.current;
    prevToday.current = today;
    setDate((d) => (d === old ? today : d));
  }, [today]);

  useEffect(() => {
    void requestPersistentStorage();
  }, []);

  function changeTab(next: Tab) {
    setTab(next);
    window.scrollTo({ top: 0 });
  }

  function openDay(d: DateKey) {
    setDate(d);
    changeTab('today');
  }

  if (!hydrated) return <div className="boot" aria-busy="true" />;

  return (
    <div className="app">
      <div className="topbar">
        <span className="brand">Reward Pie</span>
        <TabBar tab={tab} onChange={changeTab} />
      </div>

      <main>
        {tab === 'today' && (
          <TodayScreen
            date={date}
            today={today}
            onSelectDate={setDate}
            onEditCategory={(id) => setSheet({ id })}
            onCreateCategory={() => setSheet({ id: null })}
          />
        )}
        {tab === 'history' && <HistoryScreen today={today} onOpenDay={openDay} />}
        {tab === 'rewards' && (
          <RewardsScreen onEdit={(id) => setSheet({ id })} onCreate={() => setSheet({ id: null })} />
        )}
      </main>

      {sheet && <CategorySheet key={sheet.id ?? 'new'} categoryId={sheet.id} onClose={() => setSheet(null)} />}
    </div>
  );
}
