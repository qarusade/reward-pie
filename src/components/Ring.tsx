const R = 15;
const C = 2 * Math.PI * R;

interface Props {
  pct: number;
  size?: number;
  stroke?: number;
  color: string;
  track: string;
  dashedTrack?: boolean;
}

/** Маленькое кольцо прогресса (0–100%). Всегда декоративное — число дублируется текстом рядом. */
export function Ring({ pct, size = 30, stroke = 6, color, track, dashedTrack = false }: Props) {
  const len = (Math.min(Math.max(pct, 0), 100) / 100) * C;
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true" focusable="false">
      <circle
        cx="18"
        cy="18"
        r={R}
        fill="none"
        stroke={track}
        strokeWidth={dashedTrack ? 2 : stroke}
        strokeDasharray={dashedTrack ? '3 4' : undefined}
      />
      {len > 0 && (
        <circle
          cx="18"
          cy="18"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${len} ${C}`}
          transform="rotate(-90 18 18)"
        />
      )}
    </svg>
  );
}
