import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup, configure } from '@testing-library/react';

import { resetDb } from '@/mocks/db';
import { server } from '@/mocks/server';
import { useLanguageStore } from '@/stores/useLanguageStore';

import '@testing-library/jest-dom/vitest';

// 頁面是 lazy 載入且先 suspend;平行跑測試、機器又慢時,第一次渲染可能超過預設的 1 秒。
configure({ asyncUtilTimeout: 3000 });

// antd 依賴 jsdom 沒有的 matchMedia。
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetDb();
  localStorage.clear();
  // 測試固定以預設語言執行,斷言一律引用字典,不寫死文字。
  useLanguageStore.setState({ language: 'zh-TW' });
});

afterAll(() => server.close());
