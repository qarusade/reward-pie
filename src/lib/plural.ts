/** Русская форма слова для числа: plural(5, ['задача', 'задачи', 'задач']) → 'задач'. */
export function plural(n: number, forms: [one: string, few: string, many: string]): string {
  const abs = Math.abs(n);
  const a = abs % 10;
  const b = abs % 100;
  if (a === 1 && b !== 11) return forms[0];
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return forms[1];
  return forms[2];
}

export const tasksWord = (n: number) => plural(n, ['задача', 'задачи', 'задач']);
export const timesWord = (n: number) => plural(n, ['раз', 'раза', 'раз']);
export const daysWord = (n: number) => plural(n, ['день', 'дня', 'дней']);
