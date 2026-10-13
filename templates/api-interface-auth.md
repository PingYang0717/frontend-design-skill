# API 契約:身分與權限

> 骨架既有的端點。前端在 `src/api/authApi.ts` 呼叫、`src/types/api/user.ts` 定義型別、`src/mocks/handlers.ts` 模擬。
> 與後端確認後把狀態改為「已確認」;欄位名稱與後端不同時,改這份契約與上述三個檔案,不在前端轉換。

## 共通

- 認證方式:<!-- FILL: SSO / Cookie / Bearer token 等;不知道寫「待確認」 -->
- 權限代碼格式:`<資源>:<動作>`,與 `src/constants/permissions.ts` 逐字一致

## `GET /me` — 目前登入的使用者

| 項目 | 內容                                    |
| ---- | --------------------------------------- |
| 狀態 | 草案                                    |
| 權限 | 任何已登入使用者                        |
| 用在 | 外殼(選單依權限過濾)、路由守衛、`<Can>` |

回應 `200`:

```json
{ "id": "user-1", "name": "王小明", "permissions": ["items:read", "items:write"] }
```

未登入時:<!-- FILL: 401 後前端要導到哪裡(登入頁網址);不知道寫「待確認」 -->

```ts
// 與 src/types/api/user.ts 一致
export interface CurrentUser {
  id: string;
  name: string;
  permissions: string[];
}
```
