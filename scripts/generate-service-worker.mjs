import { generateSW } from 'workbox-build';

const MAX_PRECACHE_FILE_BYTES = 15 * 1024 * 1024;

const { count, size, warnings } = await generateSW({
  cacheId: 'mermaid-editor',
  cleanupOutdatedCaches: true,
  clientsClaim: true,
  disableDevLogs: true,
  globDirectory: 'dist',
  globPatterns: ['**/*.{css,html,js,woff2}'],
  inlineWorkboxRuntime: true,
  maximumFileSizeToCacheInBytes: MAX_PRECACHE_FILE_BYTES,
  mode: 'production',
  navigateFallback: 'index.html',
  skipWaiting: false,
  sourcemap: false,
  swDest: 'dist/sw.js',
});

for (const warning of warnings) {
  console.warn(warning);
}

if (count === 0) {
  throw new Error('Service worker generation found no production assets to precache.');
}

console.log(`Generated offline precache for ${count} files (${size} bytes).`);
