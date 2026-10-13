# 工具鏈(Lint / Format / CI)

能用工具強制的規則都交給工具;這份文件說明每個工具管什麼、為什麼這樣分工。
分層規則的決策背景見 [ADR-0013](../adr/0013-lint-enforces-layer-boundaries.md)。

## 1. 分工:oxlint、ESLint、Prettier

`npm run lint` 依序跑 `oxlint && eslint .`;格式只由 Prettier 處理。

| 工具     | 設定檔             | 負責                                                                                                                                                   | 為什麼留著                              |
| -------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| oxlint   | `.oxlintrc.json`   | correctness 規則(預設)、`react/rules-of-hooks`(error)、`typescript/no-explicit-any`(error)、`react/only-export-components`(warn)                       | Rust 實作,毫秒級跑完全專案,當第一道關卡 |
| ESLint   | `eslint.config.js` | ① `simple-import-sort`(import/export 排序)② `react-hooks` recommended(含 React Compiler 規則,全部 warn)③ `no-restricted-imports`(分層規則、禁止 `../`) | 這三件事 oxlint 沒有對等能力            |
| Prettier | `.prettierrc.json` | 純格式:單引號、分號、`printWidth: 120`、`trailingComma: es5`、2 空格                                                                                   | 與 lint 分離,避免規則互相打架           |

**原因:** 同一條規則只由一個工具報。`react-hooks/rules-of-hooks` 只由 oxlint 報 error,ESLint
那邊關掉,同一個問題才不會出現兩次。

- ESLint 的 `react-hooks` 規則用鍵映射全部降為 warn:升級後新增的規則自動跟著降級。warn 也要處理,
  不要讓警告累積。
- 不要在 ESLint 加 oxlint 已經有的規則;要加規則,先查 oxlint 有沒有。
- 不要用 `// eslint-disable` / `// oxlint-disable` 繞過。真的必要時,只停用單一規則單一行,並寫理由。
- import 不手動排序,`eslint --fix` 會排好。分組:react 與外部套件 → `@/` 與 `./` → 樣式 → 副作用 import。

## 2. 分層規則:哪一層不准 import 什麼

依賴方向:`pages → components → hooks → api → types / utils / constants`。由 ESLint
`no-restricted-imports`(`eslint.config.js` 的 `LAYER_RULES`)強制,違反即 error。

| 層                                       | 不准 import                                                         | 原因                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `components/`、`pages/`                  | `@/api/*`(`@/api/apiError` 除外)、`axios`                           | 元件透過 `@/hooks` 的資料 hook 拿資料;錯誤判讀函式是唯一例外                 |
| `hooks/`                                 | `@/components/*`、`@/pages/*`、`@/app/*`、`axios`                   | hook 不依賴 UI;HTTP 一律走 `apiClient`                                       |
| `stores/`                                | `@/api/*`、`@/hooks/*`、`@/components/*`、`@/pages/*`               | Zustand 只放 UI 狀態,伺服器資料走 TanStack Query                             |
| `api/`、`utils/`、`types/`、`constants/` | `@/hooks/*`、`@/stores/*`、`@/components/*`、`@/pages/*`、`@/app/*` | 底層不可反向依賴                                                             |
| `i18n/`、`theme/`                        | `@/api/*`、`@/hooks/*`、`@/components/*`、`@/pages/*`、`@/app/*`    | 只依賴 stores、types、constants                                              |
| `app/` 與以上各層                        | `@/mocks/*`(`NO_MOCKS`)                                             | 正式程式碼不得依賴 mock;只有 `main.tsx`(開發期開關)、`mocks/` 自己與測試可以 |
| 所有檔案                                 | `../*`、`../**`                                                     | 跨資料夾一律 `@/`;相對路徑會繞過上面的比對                                   |

分層規則**不套用在測試檔**(`src/**/*.test.ts(x)`,`TEST_FILES`):測試需要 import mocks 與跨層組裝。
`../` 的禁令在測試檔仍然有效(由基本設定帶入)。

✅ 正確

```ts
// src/components/items/ItemTable.tsx
import { useItems } from '@/hooks/useItems';
```

❌ 錯誤

```ts
// src/components/items/ItemTable.tsx
import { listItems } from '@/api/itemApi'; // 元件直接呼叫 endpoint
import axios from 'axios'; // 元件自己開 HTTP
```

**注意:** 後出現的 `no-restricted-imports` 設定會**整條覆蓋**前面的,所以 `eslint.config.js`
把 `NO_PARENT_RELATIVE` 與 `NO_MOCKS` 自動併進每個分層區塊。新增分層規則時加進 `LAYER_RULES`
陣列(沒有額外限制的層也要列,例如 `app/` 的 `patterns: []`,`NO_MOCKS` 才套得上),不要另寫區塊。

`mocks/`、`test/` 與 `src/main.tsx` 不在 `LAYER_RULES` 內,它們的依賴方向靠 review。

## 3. Commit 前:husky + lint-staged + commitlint

`npm ci` 時 `prepare` 腳本會安裝 husky hook。

| Hook       | 檔案                | 做什麼                                                                            |
| ---------- | ------------------- | --------------------------------------------------------------------------------- |
| pre-commit | `.husky/pre-commit` | `npx lint-staged`                                                                 |
| commit-msg | `.husky/commit-msg` | `npx --no -- commitlint --edit "$1"`(格式見 [git-workflow.md](./git-workflow.md)) |

`.lintstagedrc.json` 只處理暫存區的檔案:

| 檔案類型                   | 依序執行                                             |
| -------------------------- | ---------------------------------------------------- |
| `*.{js,ts,tsx}`            | `oxlint --fix` → `eslint --fix` → `prettier --write` |
| `*.{css,json,md,yml,yaml}` | `prettier --write`                                   |

- 不需要手動格式化或排 import。
- 不要用 `git commit --no-verify` 跳過;CI 會再檢查一次,跳過只是把失敗延後。
- lint-staged 不跑 typecheck 與測試(太慢);那兩項由 CI 擋。

## 4. CI:Azure DevOps Pipelines

設定在 `azure-pipelines.yml`。觸發:推到 `main`、以及目標為 `main` 的 PR。

| 步驟                 | 指令                                 | 擋什麼                                           |
| -------------------- | ------------------------------------ | ------------------------------------------------ |
| Use Node.js          | `NodeTool@0`,`22.22.x`               | 與 `package.json` 的 `engines.node` 一致         |
| Cache npm            | `Cache@2`,key 含 `package-lock.json` | 加速安裝                                         |
| Install dependencies | `npm ci`(`HUSKY=0`)                  | 完全依 lockfile 安裝,不悄悄升級;CI 不裝 git hook |
| Lint                 | `npm run lint`                       | oxlint + ESLint                                  |
| Typecheck            | `npm run typecheck`                  | `tsc -b`:app、test、node 三份 tsconfig           |
| Test                 | `npm test`                           | Vitest 全部測試(含兩支 i18n 守門測試)            |
| Build                | `npm run build`                      | `tsc -b tsconfig.app.json && vite build`         |

四項檢查全綠才能合併:在 `main` 的分支原則設定 Build validation 指向這條 pipeline
(見 [git-workflow.md](./git-workflow.md))。

## 5. 常用 npm scripts

| 指令                                | 用途                                                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `npm ci`                            | 安裝依賴。**一律用 `npm ci`**,不用 `npm install`(見 [ADR-0016](../adr/0016-dependency-versioning-and-lockfile.md)) |
| `npm run dev`                       | 開發伺服器,`/api` 轉給 `VITE_PROXY_TARGET`(預設 `http://localhost:8080`)                                           |
| `npm run dev:mock`                  | 開發伺服器 + MSW 假後端(讀 `.env.mock`,見 [mocking.md](./mocking.md))                                              |
| `npm run build`                     | 正式建置(只檢查 `tsconfig.app.json`,不含 mocks)                                                                    |
| `npm run preview`                   | 預覽 build 產物                                                                                                    |
| `npm run typecheck`                 | 三份 tsconfig 全部檢查                                                                                             |
| `npm run lint` / `npm run lint:fix` | 檢查 / 自動修正                                                                                                    |
| `npm test` / `npm run test:watch`   | 跑一次 / 監看模式                                                                                                  |

推出去之前,本機至少跑一次 `npm run lint && npm run typecheck && npm test && npm run build`
(PR 範本的自我檢查第一項)。

## 6. 依賴版本

- `package.json` 用 `^` 範圍;`package-lock.json` 進版控;安裝一律 `npm ci`。
- 升級套件:`npm install <pkg>@<版本>` 後,lockfile 與 `package.json` 一起 commit
  (type 用 `build`),四項檢查全綠才合併。
- `typescript` 用 `~`(只接受 patch):TypeScript 的 minor 版本可能帶來新的型別錯誤。
- 新增依賴前先確認團隊技術棧裡沒有現成的方案(見 [tech-stack.md](./tech-stack.md))。

## 7. 環境變數

- 前端環境變數一律 `VITE_` 開頭,會被打包進前端程式,**不可放任何機密**。
- 範本在 `.env.example`;本機覆寫寫在 `.env.local`(不進版控)。
- 新增變數:`.env.example` 加註解說明 → `src/vite-env.d.ts` 的 `ImportMetaEnv` 加型別。

## 8. 不採用

`.editorconfig`、`.nvmrc`、`.vscode/`:編輯器設定由個人決定,格式一致性由 Prettier +
lint-staged 保證;Node 版本由 `package.json` 的 `engines` 與 CI 的 `NodeTool` 決定。
