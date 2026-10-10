import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', timeout: 30_000, use: {baseURL:'http://127.0.0.1:8080', viewport:{width:1440,height:1000}},
});
