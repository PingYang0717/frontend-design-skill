/** 後端錯誤回應的 body。`code` 決定介面文案,`message` 只當技術細節(docs/conventions/error-handling.md)。 */
export interface ApiErrorBody {
  code: string;
  message?: string;
}

/** 前端有對應文案的錯誤 code。每一個都必須在 i18n 字典 `errors.byCode` 裡有一句(測試會檢查)。 */
export const KNOWN_ERROR_CODES = ['VALIDATION_FAILED', 'CONFLICT'] as const;

export type KnownErrorCode = (typeof KNOWN_ERROR_CODES)[number];
