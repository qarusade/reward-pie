import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Прод-сборка живёт на GitHub Pages по адресу https://qarusade.github.io/reward-pie/,
// поэтому все пути в сборке начинаются с /reward-pie/. Дев-сервер работает от корня.
// Переезд на свой домен или Vercel — поменять base на '/'.
const PAGES_BASE = '/reward-pie/';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? PAGES_BASE : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        id: 'reward-pie',
        name: 'Reward Pie — задачи и награды',
        short_name: 'Reward Pie',
        description: 'Задачи по категориям и награды, которые открываются по кусочку',
        lang: 'ru',
        theme_color: '#FFE14D',
        background_color: '#FFE14D',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
}));
