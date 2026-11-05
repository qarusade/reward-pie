import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { pieGeometry } from '../lib/stats';
import type { Reward } from '../types';
import { RewardArt } from './RewardArt';

interface Props {
  reward: Reward;
  done: number;
  total: number;
  size: number;
  /** Текст для скринридера. Без него картинка считается декоративной. */
  label?: string;
}

/**
 * Картинка-награда как круговая диаграмма: круг порезан на `total` кусков,
 * открыто `done` из них (по часовой от 12 часов), остальное под белой «пеленой».
 */
export function RewardPie({ reward, done, total, size, label }: Props) {
  const { deg, slice } = pieGeometry(done, total);
  const open = total > 0 && done >= total;
  const pop = usePopOnOpen(open);
  const cut = size >= 160 ? 1 : size >= 80 ? 2 : 3;

  const style = {
    width: size,
    height: size,
    '--deg': `${deg}deg`,
    '--slice': `${slice}deg`,
    '--cut': `${cut}deg`,
  } as CSSProperties;

  return (
    <div
      className={`pie${pop ? ' pie--pop' : ''}`}
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <RewardArt reward={reward} />
      <div className="pie__wash" />
      {total >= 2 && <div className="pie__cuts" />}
    </div>
  );
}

/** Короткая анимация «награда открыта» — только в момент открытия, не при каждом показе. */
function usePopOnOpen(open: boolean): boolean {
  const prev = useRef(open);
  const [pop, setPop] = useState(false);
  useEffect(() => {
    const justOpened = open && !prev.current;
    prev.current = open;
    if (!justOpened) return;
    setPop(true);
    const t = setTimeout(() => setPop(false), 700);
    return () => clearTimeout(t);
  }, [open]);
  return pop;
}
