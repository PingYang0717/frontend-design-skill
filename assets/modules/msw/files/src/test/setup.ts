import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';
import { cleanup, configure } from '@testing-library/react';

import { connectSession } from '@/app/session';
import { MOCK_ACCESS_TOKEN, resetDb } from '@/mocks/db';
import { server } from '@/mocks/server';
import { useSessionStore } from '@/stores/useSessionStore';

import '@testing-library/jest-dom/vitest';

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
  connectSession();
  server.listen({ onUnhandledFrame: 'error' });
});

// 測試預設已登入;要測未登入的情況,在測試裡 useSessionStore.setState({ accessToken: null })。
beforeEach(() => {
  useSessionStore.setState({ accessToken: MOCK_ACCESS_TOKEN });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetDb();
  localStorage.clear();
});

afterAll(() => server.close());
