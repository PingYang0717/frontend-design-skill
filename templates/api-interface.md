# API 契約:{{API_DOMAIN}}

> 契約的唯一來源。前端 DTO(`src/types/api/`)與 mock handler(`src/mocks/handlers.ts`)都必須與這裡**逐字一致**:
> 欄位名稱、大小寫、列舉值、日期格式都不在前端改寫([ADR-0003](../adr/0003-dto-matches-backend-contract.md))。
> 契約由前端依 prototype 提出草案時,狀態標「草案」,後端確認後改為「已確認」。

## 共通

- Base path:`/api`
- 錯誤回應:`{ "code": "SCREAMING_CASE", "message": "給維運看的說明" }`;前端依 `code` 決定文案
- 日期時間:ISO 8601 字串(UTC)

<!-- FILL: 認證方式、分頁格式、其他共通約定;不知道就寫「待確認」。 -->

## 端點

<!-- FILL: 每個端點一節,格式照下方的 GET /items 範例。來源:docs/_bootstrap/prototype-analysis.md 的「每個畫面需要的資料」。範例是格式示範,填入實際端點後刪除。 -->

### `GET /items` — 列出項目

| 項目 | 內容                   |
| ---- | ---------------------- |
| 狀態 | 草案 / 已確認 / 已上線 |
| 權限 | `items:read`           |
| 用在 | 項目管理頁             |

回應 `200`:`Item[]`

```json
[{ "id": "item-1", "name": "範例項目 A", "status": "ACTIVE", "updatedAt": "2026-01-05T09:00:00.000Z" }]
```

可能的錯誤 code:<!-- FILL -->

## 型別

```ts
// 與 src/types/api/ 一致
```
