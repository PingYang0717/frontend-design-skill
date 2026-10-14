import React, { type ReactNode, useState } from 'react';
import { App as AntdApp, ConfigProvider } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import { QueryClientProvider } from '@tanstack/react-query';

import { buildAntdTheme } from '@/theme/antdTheme';
import { themeCssText } from '@/theme/cssVars';
import { createQueryClient } from './queryClient';

interface AppProvidersProps {
  children: ReactNode;
}

/** 所有 Provider 集中在這裡;測試的 render helper 也用它,畫面與測試走同一條路。 */
const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={buildAntdTheme()}
        locale={zhTW}
        // antd 預設在兩個中文字的按鈕中間插空白(「新 增」),螢幕閱讀器與測試都會讀到那個空白。
        button={{ autoInsertSpace: false }}
      >
        <style>{themeCssText()}</style>
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default AppProviders;
