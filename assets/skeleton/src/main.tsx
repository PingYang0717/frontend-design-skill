import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '@/app/App';
import { connectSession } from '@/app/session';

import './index.css';

// 登入狀態接上 apiClient(帶 token、401 清 session),要在第一個請求之前。
connectSession();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
