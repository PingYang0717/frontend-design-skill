/** 後端錯誤回應的 body。`code` 決定介面文案,`message` 只當技術細節(docs/conventions/error-handling.md)。 */
export interface ApiErrorBody {
  code: string;
  message?: string;
}

/** 前端有對應文案的錯誤 code。每一個都必須在 utils/describeError.ts 的 ERROR_COPY_BY_CODE 有一句
 *  (選了 i18n 時在字典 `errors.byCode`,測試會檢查)。閘門用的 code(若後端以 code 表示)寫在 app/accessGate.ts,不在這裡。 */
export const KNOWN_ERROR_CODES = ['VALIDATION_FAILED', 'CONFLICT'] as const;

export type KnownErrorCode = (typeof KNOWN_ERROR_CODES)[number];
