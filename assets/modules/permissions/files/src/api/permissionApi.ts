import { apiClient } from './apiClient';
import { apiPath } from './apiPath';
import { expectArray } from './expectArray';

/** 權限清單的端點。公司沒有統一的 API:路徑與回傳形狀在收件時問(docs/adr/0021-access-gate.md 第 3 節),
 *  只改這個檔案;回傳不是 `string[]` 時在這裡轉成 `string[]`(DTO 仍與後端逐字一致,見 docs/conventions/api.md 第 4 節)。 */

/** 取得目前使用者在這個系統的權限代碼清單;啟動時呼叫一次,外殼、路由守衛與按鈕都讀它。
 *  @screen 全站(AppShell、RequirePermission) */
export const getPermissions = async (): Promise<string[]> =>
  expectArray<string>(await apiClient.get<unknown>(apiPath('permissions')), 'GET /permissions');
