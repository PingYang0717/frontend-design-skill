import React, { type ReactNode } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';

import ErrorBoundary from './ErrorBoundary';
import SuspenseLoader from './SuspenseLoader';

interface DataBoundaryProps {
  children: ReactNode;
  /** 這個區塊在載入什麼,用在 loading 與錯誤文案,例如「項目」。 */
  what: string;
}

/** useSuspenseQuery 需要的兩半:等待時的畫面與失敗時的畫面。
 *  每個窗格各包一個,而不是整個 app 一個:一個區塊失敗不會連帶清空旁邊的區塊。
 *  QueryErrorResetBoundary 讓「重試」真的重新抓取,而不是立刻再丟出快取裡的錯誤。 */
const DataBoundary: React.FC<DataBoundaryProps> = ({ children, what }) => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <ErrorBoundary what={what} onRetry={reset}>
        <SuspenseLoader what={what}>{children}</SuspenseLoader>
      </ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
);

export default DataBoundary;
