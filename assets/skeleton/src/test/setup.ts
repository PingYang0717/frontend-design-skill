import { afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { cleanup, configure } from '@testing-library/react';

import { getCurrentUser } from '@/api/authApi';
import { connectSession } from '@/app/session';
import { useSessionStore } from '@/stores/useSessionStore';
import { TEST_ACCESS_TOKEN, TEST_USER } from './fixtures';

import '@testing-library/jest-dom/vitest';

// 沒有假後端:API 模組由 vi.mock 換成 vi.fn。身分端點每個畫面都會打,在這裡統一換掉;
// 各資源的 API(例如 @/api/itemApi)由用到的測試檔自己 vi.mock,並在 beforeEach 給預設回應。
vi.mock('@/api/authApi');

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
});

// 測試預設已登入、擁有全部權限;要測未登入,在測試裡 useSessionStore.setState({ accessToken: null })。
beforeEach(() => {
  useSessionStore.setState({ accessToken: TEST_ACCESS_TOKEN });
  vi.mocked(getCurrentUser).mockResolvedValue(TEST_USER);
});

afterEach(() => {
  cleanup();
  // 清掉每個 vi.fn 的回應與呼叫紀錄,下一個測試從 beforeEach 的預設開始。
  vi.resetAllMocks();
  localStorage.clear();
});
