# 0003. `types/api/` 與後端契約逐字一致,不設轉換層

## 背景

後端回傳的形狀常常和前端「想要」的形狀有落差:欄位命名慣例不同(`updated_at` vs
`updatedAt`)、enum 是 SCREAMING_CASE、某些欄位是 JSON 字串、清單內嵌在詳細資料裡。

可以在 api 層加一層 mapper,讓 UI 讀本專案自己的型別;也可以讓型別逐字跟著線路走。mapper
的代價是每個端點兩份型別、一個轉換函式與它的測試,而且兩份型別之間的對應只活在 mapper 裡,
後端改一個欄位要追兩處。

## 決策

**1. `src/types/api/` 與後端 DTO 逐字一致,不設轉換層。** 「逐字」指**不改名**:欄位沿用
線路上的拼法,enum 值維持原樣(`'ACTIVE' | 'ARCHIVED'`)。後端改名,前端跟著改。

**2. 只收前端消費的欄位。** `types/api` 描述前端用到什麼,不是後端吐了什麼。沒有消費端的
欄位不收——它會讓讀型別的人以為有功能。完整的線路形狀記在 `docs/api/` 的契約文件。

**3. 需要轉換的地方在使用點做。** 例如 enum 轉文案在字典裡查
(`t.items.status[item.status]`),日期在 render 時格式化;不在 api 層先轉好。

**4. 前端自己的概念不上線路、不進 `types/api/`。** UI 內部型別(元件 props、表單值)跟著
使用它的元件或 hook 走。

**5. 契約字串集中一處。** 權限代碼(`constants/permissions.ts`)、錯誤 code
(`types/api/error.ts` 的 `KNOWN_ERROR_CODES`)都與後端逐字一致,前端以它們為 key 查表。

✅

```ts
// src/types/api/item.ts
export interface Item {
  id: string;
  name: string;
  status: ItemStatus;
  updatedAt: string;
}

export type ItemStatus = 'ACTIVE' | 'ARCHIVED';
```

```tsx
<Tag>{t.items.status[item.status]}</Tag>
```

❌

```ts
// 在 api 層把線路形狀轉成另一套型別
const toItem = (dto: ItemDto): ItemViewModel => ({
  ...dto,
  isActive: dto.status === 'ACTIVE',
  updated: new Date(dto.updatedAt),
});
```

規則細節見 [`api.md`](../conventions/api.md)、[`typescript.md`](../conventions/typescript.md)。

## 後果

- 接真後端時沒有形狀落差;mock handler 與 DTO 也就能直接對照 `docs/api/`
  ([ADR-0011](0011-dev-mocks-removed-when-endpoint-ships.md))。
- 線路的怪形狀(JSON 字串欄位、巢狀過深)會滲進 UI 的使用點;這是刻意付的代價,不另包一層。
- 型別只是編譯期的宣稱,不驗 runtime;防線的取捨見
  [ADR-0006](0006-api-errors-judged-in-one-place.md)。
- 後端改契約時,typecheck 會在每個使用點報錯,修改範圍一目了然。

### 何時重新討論

- 同一份資料要接兩個形狀不同的後端(例如新舊 API 並存一段時間),轉換層才開始划算。
- 某個線路形狀讓超過一處使用點重複解析同一件事時,先抽成 `utils/` 的純函式,仍不改型別。
