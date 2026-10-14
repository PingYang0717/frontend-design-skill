import type { Language } from '@/stores/useLanguageStore';

/** 語言選單的選項名稱。刻意不進字典:語言名稱一律用該語言自己的寫法,
 *  切到英文時,使用者仍要認得出「繁體中文」才切得回來。 */
export const LANGUAGE_LABELS: Record<Language, string> = {
  'zh-TW': '繁體中文',
  en: 'English',
};
