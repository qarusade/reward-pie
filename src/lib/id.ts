/**
 * Уникальный id. crypto.randomUUID есть только в безопасном контексте
 * (https / localhost), а на телефоне по http://192.168… его нет — отсюда запасной вариант.
 */
export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      /* небезопасный контекст */
    }
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
