# TypeScript

## 1. strict 開啟,不關回去

**規則:** 三份 tsconfig 都開 `strict: true`,另外開 `noUnusedLocals`、`noUnusedParameters`、
`noFallthroughCasesInSwitch`、`erasableSyntaxOnly`、`noUncheckedSideEffectImports`、
`verbatimModuleSyntax`。不得關閉,也不得在檔案裡加 `// @ts-nocheck`。

**原因:** strict 下新檔案的 null 安全是免費的;關掉之後要開回來,得一次還清整個專案的債。

由 `tsc -b`(`npm run typecheck`)強制,CI 與 `npm run build` 都會跑。

- `erasableSyntaxOnly`:不准用 `enum`、`namespace`、constructor parameter properties 這類
  需要編譯產生程式碼的語法。列舉值用 `as const` 物件 + 推導型別(見第 6 節)。
- `verbatimModuleSyntax`:只拿型別時要寫 `import type` 或 `import { type X }`。

✅ 正確

```ts
import type { Item } from '@/types/api/item';
import { type Language, useLanguageStore } from '@/stores/useLanguageStore';
```

❌ 錯誤

```ts
import { Item } from '@/types/api/item'; // 型別當值 import,verbatimModuleSyntax 報錯
enum ItemStatus {
  Active = 'ACTIVE',
} // erasableSyntaxOnly 報錯
```

## 2. 禁止 `any`

**規則:** 不准寫 `any`(含 `as any`、`any[]`、泛型預設 `any`)。由 oxlint
`typescript/no-explicit-any`(`.oxlintrc.json`,error)強制。

**原因:** `any` 會關掉它碰到的每一條型別檢查,而且會沿著賦值擴散。

不准用 `// oxlint-disable` 或 `// eslint-disable` 繞過;真的遇到第三方型別缺陷,用 `unknown`
加收斂,或寫一個窄的型別宣告,並在註解寫明理由。

## 3. 不確定的值用 `unknown` 再收斂

**規則:** 外部來的、型別不確定的值(`catch` 的錯誤、`JSON.parse`、未驗證的回應)一律標成
`unknown`,用型別守衛收斂後再使用。

✅ 正確(`src/api/apiError.ts`)

```ts
const readBody = (error: unknown): Partial<ApiErrorBody> | undefined => {
  if (!isAxiosError(error)) {
    return undefined;
  }
  const data: unknown = error.response?.data;
  return typeof data === 'object' && data !== null ? (data as Partial<ApiErrorBody>) : undefined;
};
```

✅ 正確(`src/api/expectArray.ts`:先拿 `unknown`,檢查後才給型別)

```ts
expectArray<Item>(await apiClient.get<unknown>(apiPath('items')), 'GET /items');
```

❌ 錯誤

```ts
catch (e: any) { toast(e.response.data.message); } // any + 自己挖 response.data
```

- `as` 只用在**已經檢查過**之後的收窄;不用 `as` 把 `unknown` 直接變成想要的型別。
- 自訂型別守衛寫成回傳 `x is T` 的箭頭函式(例:`describeError.ts` 的 `isKnownCode`)。
- 不使用非空斷言 `!` 掩蓋可能的 `null`;先判斷再用(例:`main.tsx` 對 `#root` 的檢查)。

## 4. 回傳值與參數型別

**規則:** 匯出的函式(endpoint function、hook、util)明確標註回傳型別;模組私有的小函式與
callback 可依賴推斷。

```ts
export const listItems = async (): Promise<Item[]> => …
export const resolveAccessGate = (error: unknown): AccessGateKind | undefined => { … };
```

**原因:** 匯出函式的回傳型別是對外契約,標出來才不會因為實作改了一行就悄悄變形。

## 5. DTO 放 `types/api/`,與後端逐字一致

**規則:** 每個 API 的請求與回應型別定義在 `src/types/api/<資源>.ts`,欄位名稱、大小寫、
列舉字串與後端**逐字一致**,不在前端改名、不轉 camelCase、不加衍生欄位。詳見
[ADR-0003](../adr/0003-dto-matches-backend-contract.md) 與 [api.md](./api.md)。

✅ 正確(`src/types/api/item.ts`)

```ts
export interface Item {
  id: string;
  name: string;
  status: ItemStatus;
  updatedAt: string;
}

export type ItemStatus = 'ACTIVE' | 'ARCHIVED';
```

❌ 錯誤

```ts
export interface Item {
  itemName: string; // 後端叫 name
  updatedAt: Date; // 後端送的是 ISO 字串,型別說謊
  isActive: boolean; // 前端衍生欄位混進 DTO
}
```

- 介面用的衍生型別(例如表格列)定義在使用它的元件或 hook 旁,不放 `types/api/`。
- 日期在 DTO 裡維持 `string`,顯示時才轉換。

## 6. 列舉與常數表

**規則:** 固定集合用 `as const` 物件或陣列,型別由它推導;字典或對照表用 `satisfies` 確保涵蓋。

```ts
export const KNOWN_ERROR_CODES = ['VALIDATION_FAILED', 'CONFLICT'] as const;
export type KnownErrorCode = (typeof KNOWN_ERROR_CODES)[number];

status: { ACTIVE: '使用中', ARCHIVED: '已封存' } satisfies Record<ItemStatus, string>,
```

**原因:** 新增一個列舉值時,所有 `satisfies Record<…>` 的地方都會編譯失敗,漏寫不可能發生。

## 7. Import alias 只有 `@/`

**規則:** 唯一的 alias 是 `@/` → `src/`,定義在 `vite.config.ts`(`resolve.alias`)與
`tsconfig.app.json`、`tsconfig.test.json`(`paths`)。不新增其他 alias。

- 跨資料夾一律 `@/…`;同資料夾用 `./…`;**禁止 `../`**。由 ESLint `no-restricted-imports`
  (`eslint.config.js` 的 `NO_PARENT_RELATIVE`)強制。
- 原因:`../` 會繞過分層規則的路徑比對(見 [tooling.md](./tooling.md))。

✅ `import { useItems } from '@/hooks/useItems';`、`import styles from './AppShell.module.css';`

❌ `import { useItems } from '../../hooks/useItems';`

## 8. 三份 tsconfig 的分工

`tsconfig.json` 只有 `references`,`tsc -b` 依序檢查下面三份:

| 檔案                 | 涵蓋                                                                    | 環境型別              | 用途                                  |
| -------------------- | ----------------------------------------------------------------------- | --------------------- | ------------------------------------- |
| `tsconfig.app.json`  | `src/`,**排除** `src/test`、`*.test.ts(x)`(選了 msw 再排除 `src/mocks`) | `vite/client`         | 正式程式碼;`npm run build` 只檢查這份 |
| `tsconfig.test.json` | 整個 `src/`(含測試)                                                     | `vite/client`、`node` | 測試;`npm run typecheck` 才檢查       |
| `tsconfig.node.json` | `vite.config.ts`                                                        | `node`                | 建置設定本身                          |

**原因:** 正式程式碼不該能用到 `node:fs` 或測試工具;把測試(與 mocks)排除在 app 設定之外,
不小心 import 會直接型別錯誤,正式建置也不需要安裝測試工具。

- 新增設定檔(例如另一個 `*.config.ts`)要加進 `tsconfig.node.json` 的 `include`。
- 環境變數的型別宣告在 `src/vite-env.d.ts` 的 `ImportMetaEnv`;新增 `VITE_*` 變數時同步加上,
  並寫進 `.env.example`。
