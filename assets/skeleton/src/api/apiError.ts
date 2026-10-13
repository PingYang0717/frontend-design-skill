import { isAxiosError } from 'axios';

import type { ApiErrorBody } from '@/types/api/error';

/** 「這是什麼錯」只在這裡判斷。呼叫端不自己挖 `response.data`,也不自己比對錯誤名稱。 */

const readBody = (error: unknown): Partial<ApiErrorBody> | undefined => {
  if (!isAxiosError(error)) {
    return undefined;
  }
  const data: unknown = error.response?.data;
  return typeof data === 'object' && data !== null ? (data as Partial<ApiErrorBody>) : undefined;
};

/** 連不到後端(沒有任何 HTTP 回應)。 */
export const isOffline = (error: unknown): boolean =>
  isAxiosError(error) && error.response === undefined && error.code !== 'ERR_CANCELED';

/** 請求被取消。以 name 判斷,因為 fetch 的 AbortError 跨 realm 時 instanceof 不可靠。 */
export const isCanceled = (error: unknown): boolean =>
  error instanceof Object && 'name' in error && (error.name === 'CanceledError' || error.name === 'AbortError');

/** HTTP 狀態碼;不是 HTTP 錯誤時為 undefined。 */
export const httpStatus = (error: unknown): number | undefined =>
  isAxiosError(error) ? error.response?.status : undefined;

/** 只有 404 代表「這個東西不在了」;500、逾時、斷線都不能說成已刪除。 */
export const isNotFound = (error: unknown): boolean => httpStatus(error) === 404;

export const isForbidden = (error: unknown): boolean => httpStatus(error) === 403;

/** 後端的錯誤 code,決定介面文案。 */
export const errorCode = (error: unknown): string | undefined => {
  const code = readBody(error)?.code;
  return typeof code === 'string' ? code : undefined;
};

/** 後端的原話,只當技術細節顯示,不當主文案。 */
export const errorMessage = (error: unknown): string | undefined => {
  const message = readBody(error)?.message;
  if (typeof message === 'string' && message.length > 0) {
    return message;
  }
  return error instanceof Error ? error.message : undefined;
};
