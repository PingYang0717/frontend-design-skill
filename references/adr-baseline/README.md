# 架構決策紀錄(ADR)

這個目錄記錄專案「為什麼這樣做」。規則本身寫在 [`../conventions/`](../conventions/);ADR 記的是
規則背後的取捨,以及什麼情況下該重新討論。

## 團隊基線(0001–0019)

以下隨專案骨架一起產生,是團隊標準。0010、0011、0018、0019 屬於可選模組,只有收件時選了該模組才在這裡
(選了哪些見 0022)。

| 編號                                                   | 標題                                                    | 摘要                                                                                                       |
| ------------------------------------------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [0001](0001-visual-authority-is-the-prototype.md)      | 視覺權威是 UI/UX prototype                              | 樣式、排版、圖示必須符合 prototype;色票逐值進 `theme/tokens.ts`,圖示只用 `@ant-design/icons`。             |
| [0002](0002-layered-directory-structure.md)            | 目錄依「層」分,不依「功能」分                           | `api/ hooks/ components/<domain>/ stores/ …` 讓同層寫法一致、依賴方向單一。                                |
| [0003](0003-dto-matches-backend-contract.md)           | `types/api/` 與後端契約逐字一致                         | DTO 不改名、不設轉換層,只收前端消費的欄位。                                                                |
| [0004](0004-server-state-vs-ui-state.md)               | 伺服器狀態 vs UI 狀態                                   | 伺服器資料只在 TanStack Query;Zustand 只放全域 UI 狀態;篩選分頁放 URL;其餘 `useState`。                    |
| [0005](0005-suspense-query-and-data-boundary.md)       | `useSuspenseQuery` + 每個窗格一個 `DataBoundary`        | 元件不處理 loading/error;失敗被關在所屬窗格內;例外用 `useQuery` 要註解理由。                               |
| [0006](0006-api-errors-judged-in-one-place.md)         | API 錯誤集中在 `apiError.ts` 判讀                       | 錯誤判讀只有一處;回應不做通用 runtime 驗證,清單用 `expectArray` 保底。                                     |
| [0007](0007-error-copy-owned-by-frontend.md)           | 錯誤文案由前端擁有                                      | 依後端 `code` 查對照表;後端 `message` 只當技術細節。                                                       |
| [0008](0008-component-declaration-and-export.md)       | 元件的宣告與匯出只有一種形式                            | `const X: React.FC<XProps>`、只用 `export default`、固定的宣告順序。                                       |
| [0009](0009-react-compiler-over-manual-memoization.md) | 用 React Compiler 取代手寫 memoization                  | 不再手寫 `useCallback` / `useMemo` / `React.memo`,Compiler 處理不了時才加並註解。                          |
| [0010](0010-ui-copy-in-typed-dictionary.md)            | 介面文案放在 typed 字典(模組:i18n,選用時才有)           | 自建字典,漏翻是編譯錯誤,`aria-label` 也進字典,兩支守門測試。                                               |
| [0011](0011-dev-mocks-removed-when-endpoint-ships.md)  | 開發期 mock,端點上線即從開發期移除(模組:msw,選用時才有) | `npm run dev:mock` 只攔截 `pendingHandlers`;端點上線就搬到 `shippedHandlers`(只給測試);正式建置不含 mock。 |
| [0012](0012-role-based-permission-skeleton.md)         | 角色權限骨架                                            | `PERMISSIONS` 單一來源,路由、選單、元件共用 `usePermission`;真正的檢查在後端。                             |
| [0013](0013-lint-enforces-layer-boundaries.md)         | Lint 強制分層邊界                                       | oxlint + ESLint 分工;`no-restricted-imports` 擋跨層 import 與 `../`。                                      |
| [0014](0014-accessibility-baseline.md)                 | 無障礙基線                                              | 可操作的東西都有名稱、讀取狀態會被念出、dialog 與選單的焦點契約。                                          |
| [0015](0015-optimistic-updates-and-races.md)           | 樂觀更新與競態的正確性原則                              | 預設 invalidate;樂觀更新要能回滾、結果只寫回所屬對象、失敗保留使用者輸入。                                 |
| [0016](0016-dependency-versioning-and-lockfile.md)     | 依賴版本與 lockfile                                     | `^` 範圍 + `package-lock.json` 進版控;本機 `npm install`、CI `npm ci`。                                    |
| [0017](0017-login-and-session-skeleton.md)             | 登入與 session 骨架                                     | 登入頁、`useSessionStore`、`RequireAuth`、401 處理全公司一致;認證方式由專案 ADR 選定。                     |
| [0018](0018-ag-grid-for-data-tables.md)                | 資料表格一律用 AG Grid(模組:ag-grid,選用時才有)         | 透過公版 `DataGrid`;主題由 `tokens.ts` 推導、模組與授權只在 `app/agGrid.ts`;antd `Table` 不用。            |
| [0019](0019-react-hook-form-for-forms.md)              | 表單用 React Hook Form(模組:react-hook-form,選用時才有) | 狀態與驗證歸 React Hook Form,antd 只管版面與輸入元件,由公版 `FormField` 接起來。                           |

## 專案自己的 ADR(0020 起)

**0020 起由專案自行新增。** 前三份在收件時決定:0020 路由模式(history 或 hash,範本 `adr-router-mode.md`)、
0021 認證方式(範本 `adr-auth-mode.md`)、0022 選用模組(範本 `adr-selected-modules.md`)。
其他偏離或補充從 **0023** 起,常見題目:部署環境、某個區域的視覺例外。

**偏離團隊標準必須寫 ADR。** 不採用某條規範、或改變上面任何一份的決策時,新增一份 ADR 說明
背景、決策與取捨,並在新 ADR 裡連回被偏離的那份基線(基線檔案本身不改)。不寫 ADR 的
偏離,在 review 時視同違規。

## 格式

- 檔名 `NNNN-kebab-case-title.md`,編號四位數、只增不重用。
- 內容依序 `# NNNN. 標題` → `## 背景` → `## 決策` → `## 後果`;後果要寫取捨與
  「何時重新討論」。
- 只寫現行決策,不留歷史追記與日期;決策改變時直接改寫,或新增一份取代它的 ADR 並在舊的
  開頭註明「已由 ADR-NNNN 取代」。
- 每檔 200 行以內。
