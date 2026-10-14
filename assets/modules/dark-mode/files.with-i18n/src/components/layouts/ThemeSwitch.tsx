import React from 'react';
import { Segmented } from 'antd';

import { useTranslations } from '@/i18n/useTranslations';
import { useThemeStore } from '@/stores/useThemeStore';

/** header 的淺色 / 深色切換。選擇記在 useThemeStore(localStorage),Providers 依它換 antd 主題與 CSS 變數。 */
const ThemeSwitch: React.FC = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const setDarkMode = useThemeStore((state) => state.setDarkMode);
  const t = useTranslations();

  return (
    <Segmented
      aria-label={t.header.theme}
      value={isDarkMode ? 'dark' : 'light'}
      onChange={(value) => setDarkMode(value === 'dark')}
      options={[
        { value: 'light', label: t.header.light },
        { value: 'dark', label: t.header.dark },
      ]}
    />
  );
};

export default ThemeSwitch;
