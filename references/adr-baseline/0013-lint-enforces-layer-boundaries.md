# 0013. Lint 分兩層,並以 `no-restricted-imports` 強制分層邊界

## 背景

[ADR-0002](0002-layered-directory-structure.md) 定了依賴方向:
`pages → components → hooks → api → types / utils / constants`。方向只寫在文件裡時,第一個
趕時間的人(或 coding agent)就會在元件裡直接 `import { listItems } from '@/api/itemApi'`,
review 沒看到就進去了;之後這種寫法會被複製。

工具選擇上,oxlint(Rust)毫秒級跑完整個專案,但缺幾項 ESLint 外掛才有的能力:import
自動排序、React Compiler 規則、可依檔案路徑設定的 import 限制。只用 ESLint 則慢,commit
前每次都要等。

## 決策

### oxlint 與 ESLint 並存,各管各的

`npm run lint` 依序跑 `oxlint && eslint .`;Prettier 只管格式。

| 工具                         | 負責                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| oxlint(`.oxlintrc.json`)     | correctness 規則、`react/rules-of-hooks`(error)、`typescript/no-explicit-any`(error)                         |
| ESLint(`eslint.config.js`)   | `simple-import-sort`、react-hooks recommended(含 React Compiler 規則,warn)、`no-restricted-imports` 分層規則 |
| Prettier(`.prettierrc.json`) | 純格式                                                                                                       |

同一個問題只由一邊報:`react-hooks/rules-of-hooks` 在 ESLint 關掉。

### 分層規則

`eslint.config.js` 的 `LAYER_RULES` 對每一層列出「不准 import 什麼」:

| 檔案                                                 | 禁止                                                                |
| ---------------------------------------------------- | ------------------------------------------------------------------- |
| `src/app/**`                                         | (只套用下方兩條共通規則)                                            |
| `src/i18n/**`、`src/theme/**`                        | `@/api/*`、`@/hooks/*`、`@/components/*`、`@/pages/*`、`@/app/*`    |
| `src/components/**`、`src/pages/**`                  | `@/api/*`(`@/api/apiError` 除外)、`axios`                           |
| `src/hooks/**`                                       | `@/components/*`、`@/pages/*`、`@/app/*`、`axios`                   |
| `src/stores/**`                                      | `@/api/*`、`@/hooks/*`、`@/components/*`、`@/pages/*`               |
| `src/api/**`、`utils/**`、`types/**`、`constants/**` | `@/hooks/*`、`@/stores/*`、`@/components/*`、`@/pages/*`、`@/app/*` |

每個分層區塊另外帶上兩條共通規則:

- **`NO_PARENT_RELATIVE`:禁止 `../` 相對路徑**(全專案)。跨資料夾一律 `@/`,同資料夾才用
  `./`;否則 `../../api/itemApi` 就能繞過上面的規則。
- **`NO_MOCKS`(選了 msw 模組時):正式程式碼不得 import `@/mocks/*`**。只有 `src/main.tsx`(開發期開關)、
  `mocks/` 自己與測試不在限制內(ADR-0011)。

每個區塊都要重新帶上這兩條,因為後出現的 `no-restricted-imports` 設定會整條覆蓋前面的。

**分層規則不套用在測試檔**(`src/**/*.test.ts`、`src/**/*.test.tsx`):測試需要 import
mocks,也需要跨層組裝。

### 在 commit 與 CI 各跑一次

husky 的 pre-commit 跑 lint-staged(`oxlint --fix` → `eslint --fix` → `prettier --write`);
Azure Pipelines 跑完整的 `npm run lint`。

✅

```tsx
// src/components/items/ItemTable.tsx
import { isNotFound } from '@/api/apiError'; // 判讀函式是例外
import { useItems } from '@/hooks/useItems';
```

❌

```tsx
// src/components/items/ItemTable.tsx
import { listItems } from '@/api/itemApi'; // no-restricted-imports
import axios from 'axios'; // no-restricted-imports
import { useItems } from '../../hooks/useItems'; // no-restricted-imports(../)
```

規則細節見 [`tooling.md`](../conventions/tooling.md)、
[`project-structure.md`](../conventions/project-structure.md)。

## 後果

- 分層違規在編輯器裡就變紅,不必等 review。錯誤訊息直接指向對應的規範文件。
- `import type` 也受限制:元件需要 DTO 型別時從 `@/types/api/*` 取,不從 endpoint module 取。
- `app/` 是組裝點,只受兩條共通規則限制;`i18n/` 與 `theme/` 是橫切關注點,只依賴
  stores、types、constants(選了 i18n 時,`i18n/zhTW.ts` 依賴 `types/api`、`useTranslations` 讀
  `useLanguageStore` 都是允許的)。`test/`、`mocks/` 與 `src/main.tsx` 不在分層規則內。
- 兩個 linter 意味著兩份設定;新增規則時先查 oxlint 有沒有對等規則,有就放 oxlint。
- react-hooks 規則目前為 warn,不擋 commit;理由見
  [ADR-0009](0009-react-compiler-over-manual-memoization.md)。

### 何時重新討論

- oxlint 補上 import 排序與依路徑設定 import 限制的能力時,評估移除 ESLint。
- 層的清單或依賴方向改變時,先改 ADR-0002,再改 `LAYER_RULES`。
