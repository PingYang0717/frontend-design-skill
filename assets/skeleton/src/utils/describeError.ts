import { errorCode, errorMessage, httpStatus, isForbidden, isNotFound, isOffline } from '@/api/apiError';
import { KNOWN_ERROR_CODES, type KnownErrorCode } from '@/types/api/error';

/** 前端擁有的錯誤文案:後端 code → 介面上的一句話。新增 code 時少寫一句會編譯失敗(Record 要求填滿)。 */
const ERROR_COPY_BY_CODE: Record<KnownErrorCode, string> = {
  VALIDATION_FAILED: '輸入的資料不正確,請檢查後再送出。',
  CONFLICT: '資料已被其他人修改,請重新整理後再試。',
};

const OFFLINE = '無法連線到後端服務';

export interface LoadErrorCopy {
  heading: string;
  detail: string;
  /** 後端原話或例外訊息,只在錯誤卡的小字顯示。 */
  technical?: string;
}

const isKnownCode = (code: string | undefined): code is KnownErrorCode =>
  code !== undefined && (KNOWN_ERROR_CODES as readonly string[]).includes(code);

/** 讀取失敗(ErrorBoundary 顯示的錯誤卡)。`what` 是這個區塊在載入的東西,例如「項目」。 */
export const describeLoadError = (error: unknown, what: string): LoadErrorCopy => {
  if (isOffline(error)) {
    return { heading: OFFLINE, detail: '請確認網路或後端服務狀態後重試。' };
  }
  const heading = `${what}載入失敗`;
  if (isNotFound(error)) {
    return { heading, detail: `找不到這筆${what},可能已被刪除。` };
  }
  if (isForbidden(error)) {
    return { heading, detail: `你沒有檢視這筆${what}的權限。` };
  }
  const code = errorCode(error);
  return {
    heading,
    detail: isKnownCode(code) ? ERROR_COPY_BY_CODE[code] : '請稍後重試;若持續發生,請聯絡系統管理員。',
    technical: errorMessage(error),
  };
};

/** 寫入失敗(toast 只有一行,只放我們的文案,不放後端原話)。 */
export const describeActionError = (error: unknown): string => {
  if (isOffline(error)) {
    return OFFLINE;
  }
  const code = errorCode(error);
  if (isKnownCode(code)) {
    return ERROR_COPY_BY_CODE[code];
  }
  if (isForbidden(error)) {
    return '你沒有執行這個操作的權限。';
  }
  const status = httpStatus(error);
  return status === undefined ? '操作失敗,請稍後再試。' : `操作失敗(HTTP ${status}),請稍後再試。`;
};
