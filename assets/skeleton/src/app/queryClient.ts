import { QueryClient } from '@tanstack/react-query';

/** 全專案唯一的 QueryClient 設定。 */
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // 讀取失敗交給 DataBoundary 的「重試」;自動重試一次,避免一閃而過的網路抖動直接變錯誤卡。
        // 測試不重試,錯誤立刻呈現,斷言才不必等重試延遲。
        retry: import.meta.env.MODE === 'test' ? false : 1,
        refetchOnWindowFocus: false,
      },
    },
  });
