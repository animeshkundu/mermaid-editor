#!/usr/bin/env node
import { spawn, execSync } from 'node:child_process';
import http from 'node:http';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5000';
const STARTUP_TIMEOUT_MS = 30_000;
const POLL_INTERVAL_MS = 1_000;
const REQUEST_TIMEOUT_MS = 3_000;

const isServerUp = () =>
  new Promise((resolve) => {
    const request = http.get(BASE_URL, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    request.on('error', () => resolve(false));
    request.setTimeout(REQUEST_TIMEOUT_MS, () => {
      request.destroy();
      resolve(false);
    });
  });

const waitForServer = async () => {
  const start = Date.now();
  while (Date.now() - start < STARTUP_TIMEOUT_MS) {
    if (await isServerUp()) return true;
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  return false;
};

const run = async () => {
  if (await isServerUp()) {
    console.log(`[playwright] Reusing running server at ${BASE_URL}`);
    return;
  }

  console.log('[playwright] Building app for preview...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('[playwright] Starting preview server on port 5000...');
  const preview = spawn('npm', ['run', 'preview', '--', '--host', '--port', '5000'], {
    stdio: 'inherit',
    env: process.env,
  });

  const stopServer = () => {
    if (!preview.killed) {
      preview.kill('SIGTERM');
    }
  };

  process.on('SIGINT', stopServer);
  process.on('SIGTERM', stopServer);
  process.on('exit', stopServer);

  const ready = await waitForServer();
  if (!ready) {
    console.error('[playwright] Server did not start in time');
    stopServer();
    process.exit(1);
  }

  console.log('[playwright] Preview server is ready');

  // Keep process alive while preview is running
  preview.on('exit', (code) => {
    process.exit(code ?? 0);
  });
};

run().catch((err) => {
  console.error('[playwright] Failed to start test server', err);
  process.exit(1);
});
