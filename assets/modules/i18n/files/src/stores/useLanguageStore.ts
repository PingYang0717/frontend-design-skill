import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { LANGUAGE_STORAGE_KEY } from '@/constants/storage';

export const LANGUAGES = ['zh-TW', 'en'] as const;

export type Language = (typeof LANGUAGES)[number];

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

/** 預設繁體中文,不讀瀏覽器語言;使用者的選擇記在 localStorage。 */
export const useLanguageStore = create<LanguageState>()(
  devtools(
    persist(
      (set) => ({
        language: 'zh-TW',
        setLanguage: (language) => set({ language }, false, 'setLanguage'),
      }),
      { name: LANGUAGE_STORAGE_KEY }
    ),
    { name: 'Language' }
  )
);
