import type { ReactNode } from 'react';

interface IconProps {
  size?: number;
  strokeWidth?: number;
}

function Svg({ size = 22, strokeWidth = 2.2, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const CheckIcon = (p: IconProps) => (
  <Svg size={16} strokeWidth={3.5} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);

export const PlusIcon = (p: IconProps) => (
  <Svg size={20} strokeWidth={3} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg size={20} strokeWidth={2.6} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const TrashIcon = (p: IconProps) => (
  <Svg size={18} strokeWidth={2} {...p}>
    <path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5" />
  </Svg>
);

export const MoreIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);

/** Ручка для перетаскивания: две колонки по три точки. */
export const GripIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <circle cx="9" cy="6" r="1.7" />
    <circle cx="15" cy="6" r="1.7" />
    <circle cx="9" cy="12" r="1.7" />
    <circle cx="15" cy="12" r="1.7" />
    <circle cx="9" cy="18" r="1.7" />
    <circle cx="15" cy="18" r="1.7" />
  </svg>
);

export const TodayIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.5l2.5 2.5L16 9.5" />
  </Svg>
);

export const HistoryIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Svg>
);

export const GiftIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="11" width="16" height="9" rx="1.5" />
    <rect x="3" y="7" width="18" height="4" rx="1" />
    <path d="M12 7v13M12 7C10.5 3.5 7 4 7.5 6c.3 1 4.5 1 4.5 1zM12 7c1.5-3.5 5-3 4.5-1-.3 1-4.5 1-4.5 1z" />
  </Svg>
);

export const PhotoIcon = (p: IconProps) => (
  <Svg size={18} strokeWidth={2} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <circle cx="9" cy="10" r="1.8" />
    <path d="M21 16l-5-5-8 8" />
  </Svg>
);
