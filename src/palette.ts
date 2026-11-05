import type { Category, RewardKind } from './types';

/** Цвета категорий. Чёрная галочка (#111) на каждом даёт контраст ≥ 4:1. */
export const PALETTE = ['#3D6BFF', '#FF8A1F', '#1FA971', '#8F5BFF', '#FF5FA2', '#12B5C9'] as const;

export interface RewardPreset {
  kind: RewardKind;
  /** Подпись на плитке выбора. */
  short: string;
  /** Название награды по умолчанию. */
  name: string;
}

export const REWARD_PRESETS: RewardPreset[] = [
  { kind: 'pizza', short: 'Пицца', name: 'Пицца' },
  { kind: 'game', short: 'Игры', name: 'Поиграть в комп' },
  { kind: 'movie', short: 'Кино', name: 'Кино вечером' },
  { kind: 'sweet', short: 'Сладкое', name: 'Что-то сладкое' },
  { kind: 'photo', short: 'Своё фото', name: 'Своя награда' },
];

export function presetName(kind: RewardKind): string {
  return REWARD_PRESETS.find((p) => p.kind === kind)?.name ?? '';
}

export function nextColor(categories: Category[]): string {
  const used = new Set(categories.filter((c) => !c.archived).map((c) => c.color));
  return PALETTE.find((c) => !used.has(c)) ?? PALETTE[categories.length % PALETTE.length];
}

/** Стартовые категории при первом запуске — их можно переименовать или удалить. */
export function defaultCategories(now = Date.now()): Category[] {
  return [
    { id: 'work', name: 'Работа', color: PALETTE[0], reward: { kind: 'pizza', name: 'Пицца' }, createdAt: now },
    { id: 'mentor', name: 'Менторство', color: PALETTE[1], reward: { kind: 'game', name: 'Поиграть в комп' }, createdAt: now + 1 },
    { id: 'health', name: 'Здоровье', color: PALETTE[2], reward: { kind: 'movie', name: 'Кино вечером' }, createdAt: now + 2 },
  ];
}
