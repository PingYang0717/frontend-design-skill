import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { connectAccessGate } from '@/app/accessGate';
import App from '@/app/App';

import './index.css';

// 存取閘門接上 apiClient(公司網路外、沒有系統權限 → 整頁遮罩),要在第一個請求之前。
connectAccessGate();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
