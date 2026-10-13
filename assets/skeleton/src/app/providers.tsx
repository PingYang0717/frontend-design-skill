import React, { type ReactNode, useEffect, useState } from 'react';
import { App as AntdApp, ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import zhTW from 'antd/locale/zh_TW';
import { QueryClientProvider } from '@tanstack/react-query';

import { useLanguageStore } from '@/stores/useLanguageStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { buildAntdTheme } from '@/theme/antdTheme';
import { themeCssText } from '@/theme/cssVars';
import { createQueryClient } from './queryClient';

interface AppProvidersProps {
  children: ReactNode;
}

/** 所有 Provider 集中在這裡;測試的 render helper 也用它,畫面與測試走同一條路。 */
const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const language = useLanguageStore((state) => state.language);

  const [queryClient] = useState(createQueryClient);

  // 同步外部系統:<html lang> 跟著介面語言,螢幕閱讀器才會用對的語音念。
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={buildAntdTheme(isDarkMode)}
        locale={language === 'en' ? enUS : zhTW}
        // antd 預設在兩個中文字的按鈕中間插空白(「新 增」),螢幕閱讀器與測試都會讀到那個空白。
        button={{ autoInsertSpace: false }}
      >
        <style>{themeCssText(isDarkMode)}</style>
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default AppProviders;
