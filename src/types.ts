/** Ключ даты в локальном времени: 'YYYY-MM-DD'. Строки сравниваются лексикографически. */
export type DateKey = string;

export type RewardKind = 'pizza' | 'game' | 'movie' | 'sweet' | 'photo';

export interface Reward {
  kind: RewardKind;
  /** Как награда называется для пользователя: «Пицца», «Поиграть в комп»… */
  name: string;
  /** Только для kind === 'photo': квадратная картинка в виде data URL. */
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  reward: Reward;
  createdAt: number;
  /** Архивная категория не показывается в новых днях, но остаётся в истории. */
  archived?: boolean;
}

export interface Task {
  id: string;
  categoryId: string;
  date: DateKey;
  title: string;
  done: boolean;
  createdAt: number;
  doneAt?: number;
  /** Место в списке своей категории за свой день: меньше — выше. Меняется перетаскиванием. */
  order: number;
  /** Оригинал, который кнопкой «Перенести» скопировали на другой день: куда ушла копия. */
  carriedTo?: DateKey;
  /** Копия перенесённой задачи: из какого дня она пришла. */
  carriedFrom?: DateKey;
}

export type Tab = 'today' | 'history' | 'rewards';
