import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { cleanup, configure } from '@testing-library/react';

import { connectAccessGate } from '@/app/accessGate';
import { resetDb } from '@/mocks/db';
import { server } from '@/mocks/server';
import { useAccessStore } from '@/stores/useAccessStore';
import { useLanguageStore } from '@/stores/useLanguageStore';

import '@testing-library/jest-dom/vitest';

// 假後端是 MSW(src/mocks/),API 模組不 vi.mock;各資源的假資料在 mocks/db.ts。
// 公司套件(遮罩、外殼)一律換成測試替身,測試不載入公司 SDK。
vi.mock('@/vendor/companyUi', () => import('./companyUiStub'));

// 頁面是 lazy 載入且先 suspend;平行跑測試、機器又慢時,第一次渲染可能超過預設的 1 秒。
configure({ asyncUtilTimeout: 5000 });

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

// antd Dropdown、Table 的固定欄位依賴 jsdom 沒有的 ResizeObserver;測試不需要真的量尺寸。
class ResizeObserverStub {
  observe = () => {};
  unobserve = () => {};
  disconnect = () => {};
}
Object.defineProperty(window, 'ResizeObserver', { writable: true, value: ResizeObserverStub });

beforeAll(() => {
  connectAccessGate();
  server.listen({ onUnhandledFrame: 'error' });
});

// 每個測試從「沒有被閘門擋住」開始;要測遮罩,用 server.use 讓某支 API 回閘門的狀態碼(見 AccessMask.test.tsx)。
beforeEach(() => {
  useAccessStore.getState().reset();
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetDb();
  localStorage.clear();
  // 測試固定以預設語言執行,斷言一律引用字典,不寫死文字。
  useLanguageStore.setState({ language: 'zh-TW' });
});

afterAll(() => server.close());
