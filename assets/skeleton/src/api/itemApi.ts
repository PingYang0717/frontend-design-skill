import type { CreateItemRequest, Item } from '@/types/api/item';
import { apiClient } from './apiClient';
import { apiPath } from './apiPath';
import { expectArray } from './expectArray';

/** 範例 endpoint module:一個資源一個檔案,每個端點一個具名函式。
 *  每個函式的 JSDoc 第一行是功能、`@screen` 是使用它的畫面、`@error` 是這支特有的錯誤(「狀態碼 情境 → 前端處理」);
 *  `scripts/gen-api-contract.mjs` 讀這些產生 docs/api-contract.md 給後端(docs/conventions/api.md 第 7 節)。 */

/** 取得全部項目。
 *  @screen 項目管理 > 清單 */
export const listItems = async (): Promise<Item[]> =>
  expectArray<Item>(await apiClient.get<unknown>(apiPath('items')), 'GET /items');

/** 建立項目,回傳建立後的完整物件。
 *  @screen 項目管理 > 新增對話框
 *  @error 400 VALIDATION_FAILED:名稱空白或超過長度 → toast(errors.byCode) */
export const createItem = (body: CreateItemRequest): Promise<Item> => apiClient.post<Item>(apiPath('items'), body);

/** 刪除項目;已不存在也視為成功。
 *  @screen 項目管理 > 清單操作欄
 *  @error 404 項目已被別人刪除 → toast,清單重新整理後消失 */
export const deleteItem = (id: string): Promise<void> => apiClient.delete(apiPath('items', id));
