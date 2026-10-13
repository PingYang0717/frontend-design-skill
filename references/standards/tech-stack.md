# 技術棧與套件管理

> 本檔回答三件事:可以用哪些套件、要加新套件怎麼走、版本怎麼鎖與怎麼升。
> 版本策略的決策理由見 [ADR-0016](../adr/0016-dependency-versioning-and-lockfile.md)。

## 1. 核准套件清單

清單以外的套件一律走「第 2 節」的審核流程。版本以 `package.json` 為準,本表不重複寫版本號。

### 執行期(`dependencies`)

| 套件                      | 用途                                  | 選用原因                                                                          | 為何不選替代方案                                                       |
| ------------------------- | ------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `react`、`react-dom` 19   | UI                                    | 團隊既有經驗;19 搭配 React Compiler                                               | Vue / Svelte:團隊與既有專案都是 React                                  |
| `react-router` 8          | 路由                                  | 單一套件(`react-router` + `react-router/dom`);data router 支援 memory router 測試 | TanStack Router:生態與團隊經驗較少;Next.js:我們是純前端 SPA,不需要 SSR |
| `@tanstack/react-query` 5 | 伺服器資料:快取、重抓、失效、Suspense | `queryOptions` + `useSuspenseQuery` 讓 loading / error 交給邊界                   | SWR:mutation 與失效控制較弱;Redux Toolkit Query:要連 Redux 一起帶進來  |
| `zustand` 5               | 全域 UI 狀態                          | 無 Provider、selector 訂閱、`persist` / `devtools` middleware 現成                | Redux:樣板多;Context:任一值變動整棵子樹重繪                            |
| `axios`                   | HTTP                                  | interceptor(帶認證 header、拆 `res.data`)、取消、錯誤物件帶 response              | 原生 `fetch`:interceptor 與錯誤狀態碼要自己包                          |
| `antd` 6                  | 元件庫                                | 企業後台元件最齊(Table、Form、Modal);token 主題系統可餵 prototype 色票            | MUI:設計語言與 prototype 差距較大;自刻:成本高                          |
| `@ant-design/icons`       | 圖示                                  | 與 antd 同一設計語言;**唯一允許的圖示來源**                                       | 其他圖示庫、emoji、文字頂替:風格不一、無障礙名稱難控                   |

### 開發期(`devDependencies`)

| 套件                                                                     | 用途                       | 選用原因                                                                | 為何不選替代方案                                |
| ------------------------------------------------------------------------ | -------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------- |
| `vite` 8 + `@vitejs/plugin-react`                                        | 開發伺服器與建置           | 啟動快、設定少、Vitest 共用設定                                         | webpack / CRA:慢、設定重                        |
| `babel-plugin-react-compiler` + `@rolldown/plugin-babel` + `@babel/core` | React Compiler             | 自動 memoization,元件不再手寫 `useCallback` / `useMemo`(ADR-0009)       | 手動 memo:容易漏、review 成本高                 |
| `typescript` 6                                                           | 型別                       | `strict` 全開                                                           | —                                               |
| `vitest` + `jsdom`                                                       | 測試執行器                 | 與 Vite 共用設定與 alias                                                | Jest:要另外設定轉譯與 alias                     |
| `@testing-library/react`、`user-event`、`jest-dom`                       | 元件測試                   | 以使用者看得到的角色與文字查詢                                          | Enzyme:測實作細節,已停止維護                    |
| `msw` 3                                                                  | 假後端(開發期 mock 與測試) | 在網路層攔截,程式碼路徑與真後端相同                                     | 手寫 axios mock:測不到 apiClient 與 interceptor |
| `oxlint`                                                                 | 第一關 lint                | 極快;correctness 與 `no-explicit-any`                                   | 單用 ESLint:慢                                  |
| `eslint` + `@typescript-eslint/parser`                                   | 第二關 lint                | 只做 oxlint 做不到的:import 排序、react-hooks / Compiler 規則、分層規則 | 見 [tooling.md](./tooling.md)                   |
| `eslint-plugin-simple-import-sort`、`eslint-plugin-react-hooks`          | 同上                       | —                                                                       | —                                               |
| `prettier`                                                               | 格式化                     | 格式不進 review 討論                                                    | ESLint 管格式:與 Prettier 打架                  |
| `husky` + `lint-staged`                                                  | commit 前檢查              | 只處理 staged 檔案,速度可接受                                           | —                                               |
| `@commitlint/cli` + `config-conventional`                                | commit 訊息格式            | Conventional Commits                                                    | —                                               |
| `@types/*`                                                               | 型別定義                   | —                                                                       | —                                               |

### 明確不採用

| 不採用                         | 理由                                                                              |
| ------------------------------ | --------------------------------------------------------------------------------- |
| 表單函式庫(react-hook-form 等) | antd `Form` 已足夠;見 `src/components/items/ItemCreateDialog.tsx`(骨架的範例功能) |
| CSS-in-JS、Tailwind            | 樣式走 antd token + CSS Modules([styling-theme.md](./styling-theme.md))           |
| i18n 函式庫(i18next 等)        | 自有 typed 字典([i18n.md](./i18n.md))                                             |
| 日期函式庫                     | 目前只需 `toLocaleString`;真的需要時走審核流程                                    |
| E2E 框架                       | 團隊決議不採用;以 MSW 驅動的頁面測試涵蓋                                          |

## 2. 新增套件的審核流程

**規則**:加入任何不在上表的套件(含 devDependency),PR 說明必須回答下列問題;
若它**取代**了表中的套件、或成為多數程式碼都會依賴的基礎設施,另寫一份 ADR(`docs/adr/`)。

1. 解決什麼問題?現有套件或幾十行自寫程式為什麼不夠?
2. 比較過哪些替代方案?
3. 維護狀況:最近一次發版、issue 回應、授權條款(需相容商用)。
4. 對 bundle 的影響(`npm run build` 前後 `dist/assets` 大小)。
5. 放 `dependencies` 還是 `devDependencies`?只在測試或建置用到的一律 devDependency。

**原因**:每個套件都是長期維護成本與供應鏈風險;寫下理由,日後才知道能不能拿掉。

- ✅ PR 說明:「新增 `dayjs`:需要相對時間與時區換算,`Intl` 無法處理 X;比較過 date-fns(bundle 較大);
  MIT;建置後 vendor chunk +7 KB。」並更新本檔清單。
- ❌ 在功能 PR 裡順手 `npm i some-lib`,說明沒提。
- ❌ 為了一個 `debounce` 引入整個 lodash(骨架已有 [`useDebouncedValue`](../../src/hooks/useDebouncedValue.ts))。

**審核通過後**:在本檔表格補一列。新套件若需要獨立 chunk,一併更新 `vite.config.ts` 的 `codeSplitting.groups`。

## 3. 版本策略

### 3.1 `^` 範圍 + lockfile + `npm ci`

**規則**

- `package.json` 用 `^` 範圍(`npm install <pkg>` 的預設)。
- `package-lock.json` **一定進版控**,與 `package.json` 在同一個 commit 變動。
- 安裝一律 `npm ci`(本機、CI 都是)。只有「要改依賴」時才用 `npm install`。
- Node 版本以 `package.json` 的 `engines.node` 為準;CI 在 `azure-pipelines.yml` 指定同一版。

**原因**:`^` 讓升級容易;lockfile 讓每台機器裝到的版本完全相同;`npm ci` 嚴格依 lockfile 安裝,
lockfile 與 `package.json` 不一致時直接失敗,不會悄悄改寫。

- ✅ `git clone` 後執行 `npm ci`。
- ❌ 日常用 `npm install`:可能更新 lockfile,產生與功能無關的 diff。
- ❌ 刪掉 `package-lock.json` 重新產生來「解決衝突」。
- ❌ 把 `package-lock.json` 加進 `.gitignore`。

**強制**:CI(`azure-pipelines.yml`)只跑 `npm ci`;lockfile 不一致時 CI 直接失敗。

**例外**:`typescript` 用 `~`(只接受 patch)。TypeScript 的 minor 版本常帶入新的型別檢查錯誤,
不讓它跟著 `^` 自動進來。

### 3.2 lockfile 衝突

**規則**:合併時 `package-lock.json` 衝突,先解決 `package.json` 的衝突,再執行 `npm install`
讓 npm 重新產生 lockfile,最後 `npm ci` 驗證。不要手動編輯 lockfile 內容。

### 3.3 升級流程

**規則**:升級是獨立的 PR,不與功能混在一起。

1. `npm outdated` 列出可升級的套件。
2. patch / minor:可一次升多個。`npm install <pkg>@^<新版>` 或 `npm update`。
3. major:**一次一個套件一個 PR**,先讀該套件的 migration guide。
4. 執行 `npm run lint`、`npm run typecheck`、`npm test`、`npm run build` 全部通過。
5. `npm run dev` 手動開過主要頁面(淺色 / 深色)。
6. commit 訊息用 `build(deps): ...`(見 [git-workflow.md](./git-workflow.md))。
7. major 升級若改變了本檔的「選用原因」或寫法,同步更新相關規範文件。

- ✅ PR「build(deps): 升級 antd 6.6 → 6.7」,只動 `package.json` 與 `package-lock.json`。
- ❌ 在功能 PR 裡順便升 React major。

**安全性更新**:`npm audit` 回報的高風險漏洞優先處理,流程同上。
