import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

const base = '/undead-juice-co/';

export default defineConfig({
  base,
  plugins: [
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'Undead Juice Co.',
        short_name: 'Undead Juice',
        display: 'fullscreen',
        orientation: 'landscape',
        start_url: base,
        scope: base,
        background_color: '#1a1226',
        theme_color: '#1a1226',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2,webmanifest}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/(?!undead-juice-co\/)/],
      },
    }),
  ],
  build: {
    target: 'es2022',
    rollupOptions: { output: { manualChunks: { phaser: ['phaser'] } } },
    chunkSizeWarningLimit: 1600,
  },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
