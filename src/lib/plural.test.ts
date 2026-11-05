import { describe, expect, it } from 'vitest';
import { tasksWord } from './plural';

describe('plural', () => {
  it.each([
    [0, 'задач'], [1, 'задача'], [2, 'задачи'], [4, 'задачи'], [5, 'задач'],
    [11, 'задач'], [12, 'задач'], [14, 'задач'], [21, 'задача'], [22, 'задачи'], [111, 'задач'], [101, 'задача'],
  ])('%i → %s', (n, word) => {
    expect(tasksWord(n)).toBe(word);
  });
});
