import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { connectAccessGate } from '@/app/accessGate';
import App from '@/app/App';

import './index.css';

/** 開發期 mock:只在 `npm run dev:mock`(VITE_ENABLE_MOCKS=true)時啟動 MSW。
 *  `import.meta.env.DEV` 在正式建置會被替換成 false,整段連同 mocks/ 一起被移除。 */
const enableMocking = async () => {
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCKS !== 'true') {
    return;
  }
  const { worker } = await import('@/mocks/browser');
  await worker.start({ onUnhandledFrame: 'bypass' });
};

// 存取閘門接上 apiClient(公司網路外、沒有系統權限 → 整頁遮罩),要在第一個請求之前。
connectAccessGate();

await enableMocking();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
