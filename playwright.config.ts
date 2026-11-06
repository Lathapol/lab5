import { defineConfig } from '@playwright/test';

if (!process.env.TEST_DATABASE_URL || !process.env.SEED_PASSWORD) {
  throw new Error('Set TEST_DATABASE_URL and SEED_PASSWORD for the seeded test database.');
}

export default defineConfig({
  testDir: './test/browser',
  use: { baseURL: 'http://127.0.0.1:4173' },
  webServer: [
    {
      command: 'npm start',
      port: 3000,
      env: { DATABASE_URL: process.env.TEST_DATABASE_URL, PORT: '3000', NODE_ENV: 'test' },
    },
    {
      command: 'npm run dev:web -- --host 127.0.0.1 --port 4173 --strictPort',
      url: 'http://127.0.0.1:4173',
    },
  ],
});
