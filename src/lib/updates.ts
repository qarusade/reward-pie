import { registerSW } from 'virtual:pwa-register';

/** Пользователь что-то набирает или правит категорию — перезагрузка сейчас потеряла бы ввод. */
function busy(): boolean {
  const el = document.activeElement;
  const typing = (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) && el.value.trim() !== '';
  return typing || document.querySelector('dialog[open]') !== null;
}

let reloadPending = false;

/** Перезагрузиться на новую версию, но не посреди ввода: ждём, пока поле опустеет или лист категории закроют. */
function reloadWhenIdle(): void {
  if (reloadPending) return;
  reloadPending = true;
  if (!busy()) return window.location.reload();
  window.setInterval(() => {
    if (!busy()) window.location.reload();
  }, 1500);
}

/**
 * Офлайн-кеш и обновления. Новая версия ставится в фоне и сразу забирает страницу
 * (skipWaiting + clientsClaim), после чего страница перезагружается сама —
 * раньше новую версию было видно только со второго запуска.
 */
export function setupUpdates(): void {
  if (!('serviceWorker' in navigator)) return;

  // Главный сигнал: страницей стала управлять другая версия. Он приходит, кто бы ни нашёл
  // обновление, — в том числе браузер при запуске, раньше, чем успеет подключиться registerSW.
  // Самая первая установка тоже даёт этот сигнал, но тогда до неё контроллера не было: не перезагружаем.
  let controlled = navigator.serviceWorker.controller !== null;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (controlled) reloadWhenIdle();
    controlled = true;
  });

  registerSW({
    immediate: true,
    onNeedReload: reloadWhenIdle,
    onRegisteredSW(_url, registration) {
      // Установленное приложение может днями висеть в памяти телефона:
      // проверяем обновление каждый раз, когда к нему возвращаются.
      if (!registration) return;
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') void registration.update().catch(() => {});
      });
    },
  });
}
