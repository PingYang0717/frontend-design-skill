import { errorCode, errorMessage, httpStatus, isForbidden, isNotFound, isOffline } from '@/api/apiError';
import type { Translations } from '@/i18n/zhTW';
import { KNOWN_ERROR_CODES, type KnownErrorCode } from '@/types/api/error';

export interface LoadErrorCopy {
  heading: string;
  detail: string;
  /** 後端原話或例外訊息,只在錯誤卡的小字顯示。 */
  technical?: string;
}

const isKnownCode = (code: string | undefined): code is KnownErrorCode =>
  code !== undefined && (KNOWN_ERROR_CODES as readonly string[]).includes(code);

/** 讀取失敗(ErrorBoundary 顯示的錯誤卡)。`what` 是這個區塊在載入的東西,例如「項目」。 */
export const describeLoadError = (error: unknown, what: string, t: Translations): LoadErrorCopy => {
  if (isOffline(error)) {
    return { heading: t.errors.offline, detail: t.errors.offlineDetail };
  }
  if (isNotFound(error)) {
    return { heading: t.errors.loadFailed(what), detail: t.errors.notFound(what) };
  }
  if (isForbidden(error)) {
    return { heading: t.errors.loadFailed(what), detail: t.errors.forbidden(what) };
  }
  const code = errorCode(error);
  return {
    heading: t.errors.loadFailed(what),
    detail: isKnownCode(code) ? t.errors.byCode[code] : t.errors.loadFailedDetail,
    technical: errorMessage(error),
  };
};

/** 寫入失敗(toast 只有一行,只放我們的文案,不放後端原話)。 */
export const describeActionError = (error: unknown, t: Translations): string => {
  if (isOffline(error)) {
    return t.errors.offline;
  }
  const code = errorCode(error);
  if (isKnownCode(code)) {
    return t.errors.byCode[code];
  }
  const status = httpStatus(error);
  return status === undefined ? t.errors.actionFailed : t.errors.actionFailedWithStatus(status);
};
