import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { THEME_STORAGE_KEY } from '@/constants/storage';

/** Zustand store 範本:只放 UI 狀態;需要跨重新整理記住的才加 persist。
 *  devtools 放最外層,DevTools 才看得到 persist 還原後的值。 */
interface ThemeState {
  isDarkMode: boolean;
  setDarkMode: (isDarkMode: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set) => ({
        isDarkMode: false,
        setDarkMode: (isDarkMode) => set({ isDarkMode }, false, 'setDarkMode'),
      }),
      { name: THEME_STORAGE_KEY }
    ),
    { name: 'Theme' }
  )
);
