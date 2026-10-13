import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { render } from '@testing-library/react';

import AppProviders from '@/app/providers';
import { appRoutes } from '@/app/routes';

/** 以真實的 Provider 與路由表渲染整個 app,從指定網址開始。測試畫面與正式畫面走同一條路。 */
export const renderApp = (initialPath = '/') => {
  const router = createMemoryRouter(appRoutes, { initialEntries: [initialPath] });
  return {
    router,
    ...render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>,
      // 被 ErrorBoundary 接住的錯誤由它自己記一行摘要;React 預設會再把整個錯誤物件印一次,
      // AxiosError 帶著 jsdom 物件,印出來會讓 console 本身丟錯。
      { onCaughtError: () => {} }
    ),
  };
};
