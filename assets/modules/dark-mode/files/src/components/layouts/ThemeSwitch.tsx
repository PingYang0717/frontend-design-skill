import React from 'react';
import { Segmented } from 'antd';

import { useThemeStore } from '@/stores/useThemeStore';

/** header 的淺色 / 深色切換。選擇記在 useThemeStore(localStorage),Providers 依它換 antd 主題與 CSS 變數。 */
const ThemeSwitch: React.FC = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const setDarkMode = useThemeStore((state) => state.setDarkMode);

  return (
    <Segmented
      aria-label="主題"
      value={isDarkMode ? 'dark' : 'light'}
      onChange={(value) => setDarkMode(value === 'dark')}
      options={[
        { value: 'light', label: '淺色' },
        { value: 'dark', label: '深色' },
      ]}
    />
  );
};

export default ThemeSwitch;
