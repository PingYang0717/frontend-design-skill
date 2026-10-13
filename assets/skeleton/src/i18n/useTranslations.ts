import { type Language, useLanguageStore } from '@/stores/useLanguageStore';
import { en } from './en';
import { type Translations, zhTW } from './zhTW';

const DICTIONARIES: Record<Language, Translations> = { 'zh-TW': zhTW, en };

/** 目前語言的字典。回傳字典本身而不是 t('key'):`t.items.title` 全程有型別檢查,改名會在每個呼叫點編譯失敗。 */
export const useTranslations = (): Translations => {
  const language = useLanguageStore((state) => state.language);
  return DICTIONARIES[language];
};

/** 給非元件的程式(錯誤判讀、class component)用:在被呼叫的當下讀語言,不訂閱。 */
export const getTranslations = (): Translations => DICTIONARIES[useLanguageStore.getState().language];
