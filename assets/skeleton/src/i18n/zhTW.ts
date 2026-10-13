import type { KnownErrorCode } from '@/types/api/error';
import type { ItemStatus } from '@/types/api/item';

/** 介面文案的唯一來源,也是字典形狀的來源(`Translations` 由它推導)。
 *  規則見 docs/conventions/i18n.md:巢狀物件、帶變數的條目寫成函式、aria-label 也進字典。 */
export const zhTW = {
  app: {
    name: '系統名稱',
  },
  nav: {
    home: '首頁',
    items: '項目管理',
    toggleSider: '收合或展開側欄',
  },
  common: {
    loading: (what: string) => `${what}載入中…`,
    retry: '重試',
    cancel: '取消',
    confirm: '確定',
    create: '新增',
    delete: '刪除',
    search: '搜尋',
    actions: '操作',
    backHome: '回首頁',
  },
  header: {
    theme: '主題',
    light: '淺色',
    dark: '深色',
    language: '語言',
  },
  errors: {
    offline: '無法連線到後端服務',
    offlineDetail: '請確認網路或後端服務狀態後重試。',
    notFound: (what: string) => `找不到這筆${what},可能已被刪除。`,
    forbidden: (what: string) => `你沒有檢視這筆${what}的權限。`,
    loadFailed: (what: string) => `${what}載入失敗`,
    loadFailedDetail: '請稍後重試;若持續發生,請聯絡系統管理員。',
    actionFailed: '操作失敗,請稍後再試。',
    actionFailedWithStatus: (status: number) => `操作失敗(HTTP ${status}),請稍後再試。`,
    technicalDetail: '技術細節',
    byCode: {
      VALIDATION_FAILED: '輸入的資料不正確,請檢查後再送出。',
      CONFLICT: '資料已被其他人修改,請重新整理後再試。',
    } satisfies Record<KnownErrorCode, string>,
  },
  pages: {
    home: {
      title: '首頁',
      welcome: (name: string) => `歡迎回來,${name}`,
    },
    forbidden: {
      title: '沒有權限',
      description: '你的帳號沒有存取這個頁面的權限,如有需要請聯絡系統管理員。',
    },
    notFound: {
      title: '找不到頁面',
      description: '這個網址不存在,請確認連結是否正確。',
    },
  },
  items: {
    title: '項目管理',
    entity: '項目',
    searchPlaceholder: '依名稱搜尋',
    empty: '目前沒有項目',
    columns: {
      name: '名稱',
      status: '狀態',
      updatedAt: '更新時間',
    },
    status: {
      ACTIVE: '使用中',
      ARCHIVED: '已封存',
    } satisfies Record<ItemStatus, string>,
    create: {
      title: '新增項目',
      nameLabel: '名稱',
      nameRequired: '請輸入名稱',
      success: '已新增項目',
    },
    delete: {
      label: (name: string) => `刪除 ${name}`,
      confirmTitle: (name: string) => `確定要刪除「${name}」嗎?`,
      confirmContent: '刪除後無法復原。',
      success: '已刪除項目',
    },
  },
};

export type Translations = typeof zhTW;
