# CHANGELOG

## 4.0.0(2026-10-17)

**破壞性改版:基底的登入與權限換成公司的實況。** 3.x 假設每個系統自己做登入(登入頁、token、401 清 session)並打 `GET /me`
拿權限清單;公司的實況是:登入由公司前端 SDK 處理(沒有 cookie 就跳轉公司登入畫面,各系統不做登入頁、沒有登出)、
token 在 cookie 瀏覽器自動帶、後端每支 API 固定檢查「在不在公司網路」「有沒有這個系統的使用權限」,擋下來用公司的 React
元件整頁遮罩、細粒度權限多數系統不需要。3.x 產的專案不能直接套 4.0 加畫面,升級步驟見 `legacy-review.md` 第 E 節。

- **基底拆掉登入**:刪 `pages/Login/`、`stores/useSessionStore.ts`、`hooks/useSessionMutations.ts`、`components/auth/RequireAuth.tsx`、
  `components/layouts/PublicLayout.tsx`、`UserMenu.tsx`、`types/api/auth.ts`、`api/authApi.ts`、`app/session.ts` 與相關測試;
  `apiClient` 改 `withCredentials: true`,拿掉 `setAuthHeaderProvider` / `getAuthHeaders`;`KNOWN_ERROR_CODES` 拿掉 `INVALID_CREDENTIALS`;
  `routes.tsx` 只剩一個 `RootLayout` 區域;`ROUTES` 刪 `login`、`forbidden`;header 右側改為帶註解的工具列(語言、主題、使用者資訊依序放)
- **基底新增存取閘門**:`app/accessGate.ts`(`ACCESS_GATE_RULES` 一張表:狀態碼 / code → `outsideNetwork` / `noAppPermission`;
  `resolveAccessGate()`;`connectAccessGate()` 的 interceptor 判到就寫 store,錯誤仍往外拋)、`stores/useAccessStore.ts`(不 persist)、
  `components/common/AccessMask.tsx`(掛在 `AppProviders` 的 `<AntdApp>` 裡,所有頁面與外殼之上,不能關閉)、
  `vendor/companyUi.tsx`(公司套件唯一轉接點;自帶 `FallbackAccessBlocked` 讓骨架能跑,註解裡的 `{{COMPANY_UI_PACKAGE}}` 由
  `check-placeholders` 擋)、`test/companyUiStub.tsx`(測試替身,`setup.ts` 以 `vi.mock` 換掉);`AccessMask.test.tsx`
  以 `httpClient.defaults.adapter` 測 interceptor;ESLint 加 `vendor/` 分層規則(不 import api / hooks / pages / stores;底層與 stores 不 import vendor)
- **錯誤規則收成一條**:`error-handling.md` 新第 0 節「狀態碼決定全域動作,code 決定文案」;`describeActionError` 補 403 專屬文案
  (i18n 字典加 `errors.forbiddenAction`);閘門與一般 403 重疊時靠 `code` 區分,收件時確認
- **細粒度權限搬成第六個可選模組 `permissions`(建議「否」)**:`constants/permissions.ts`、`api/permissionApi.ts`(預設 `GET /permissions`
  回 `string[]`,路徑與形狀收件時問)、`hooks/usePermission.ts`(`permissionsQuery`、`usePermission`、`usePermissionChecker`)、
  **`<Can>` 與 `RequirePermission` 合併成一個 `<RequirePermission>`**(`onDenied="redirect"` 路由層、預設 `hide` 元件層,可給 `fallback`)、
  `pages/Forbidden/`、`RequirePermission.test.tsx` 四個變體(`files/`、`with-i18n`、`with-msw`、`with-i18n-and-msw`);
  `navEntries.permission`、`AppShell` 過濾、`routes.tsx` 包裝、字典 `pages.forbidden`、msw 的 `seedPermissions` + handler、
  `fixtures.TEST_PERMISSIONS` 都以 README 第 3 節的錨點改既有檔案,不另出變體;import 的位置改由 `npm run lint:fix` 排。
  規範 `permissions.md` 與 ADR-0012 隨模組進專案;Item 範例不再示範權限(按鈕不包守衛)
- **既有五個模組同步**:i18n 刪登入 / 403 / UserMenu 檔與字典條目、`HomePage` 改「歡迎使用{系統名稱}」;msw 刪 `/auth/*`、`/me` handler
  與 `MOCK_LOGIN`、`seedUser`,`setup.ts` 與 `main.tsx` 改接閘門,新增 `AccessMask.test.tsx` 的 MSW 版(`server.use` 回 423,請求真的經過
  interceptor)、`eslint.config.js` 覆蓋版重產;react-hook-form 刪登入頁變體;ag-grid / i18n 的 `ItemTable` 解開 `<Can>`;
  dark-mode README 的 `ThemeSwitch` 錨點改為右側工具列註解
- **文件**:`login.md` → `access.md`(三件事三個負責人、cookie、`vendor/companyUi.tsx`、閘門表、外殼兩種、使用者資訊三種來源、測試);
  `auth.md` 移入模組;ADR-0017 改寫為「登入交給公司 SDK,存取閘門整頁遮罩」;ADR-0012 隨模組;`templates/adr-auth-mode.md` →
  `adr-access-gate.md`(公司套件、閘門表示法、權限 API、外殼四節);0022 範本加 `permissions` 列;`SKILL.md`(description、原則 2、3、
  六題模組、步驟 3、4、檔案索引、「公版的登入、閘門與權限」表)、`workflow-detail.md`(收件三題:公司套件、閘門表示法、外殼與使用者資訊;
  步驟 3 第 4、5 項;步驟 4 規則;無人值守預設 423 / 403 標暫定、permissions 不選)、`spec-to-code.md`、`project-structure.md`(`vendor/` 列與
  依賴圖)、`routing.md`、`state-management.md`、`testing.md`、`components.md`、`api.md` 第 1、2 節、`naming.md`、`typescript.md`、
  `data-fetching.md`、`git-workflow.md`、ADR-0001 / 0002、兩份 README 索引、`templates/AGENTS.md`(第 7、資料夾速查、測試、自我檢查)、
  `templates/README.md`;`legacy-review.md` 第 B 節改六個模組、新增第 E 節「3.x 公版專案升到 4.0」
- **工具**:`gen-api-contract` 的共用錯誤列改為:401 交給公司 SDK、閘門狀態碼整頁遮罩(讀專案 `app/accessGate.ts` 的表,閘門用掉的碼不再列成
  一般錯誤)、403 錯誤卡 / toast、5xx 與斷線;`check-placeholders` 改找 `0021-access-gate.md`、加 `permissions` 模組的 marker
- 驗證:基底 lint 0 warning、typecheck、test(4 檔 14 條)、build 全綠,契約表 3 支端點;全選組合(六個模組,permissions 疊
  `with-i18n-and-msw`)重組:六份 README 的錨點全部對上,lint、typecheck、test(8 檔 38 條)、build 全綠,契約表 4 支端點、`--check` 一致,
  `check-placeholders` 正確擋下 `{{COMPANY_UI_PACKAGE}}`。本次在 Node 22.22 下驗證(engines 仍為 >=24.22)
- 未做 / 已知限制:公司 SDK 拿不到,`companyUi.tsx` 的接法在第一個真實專案可能要微調;閘門狀態碼每案不同,第一版契約表的錯誤列要在回報核對;
  `ag-grid.md` 第 8 節的待補項目不變

## 3.3.0(2026-10-16)

**三件事:回收 UI/UX React prototype 已驗證的邏輯、AG Grid 的表格樣式有正規出口、步驟 5 產出後端 API 契約表。**
起因是實作時發現:UI/UX 的 React 其實也是 skill 跑出來、功能驗證過的,整包丟掉重猜很浪費;AG Grid 的樣式只對應 11 個
Theming API 參數、列高 / 表頭 / 斑馬紋沒有出口,agent 在「做不出來 → 寫 `.ag-*` 覆寫 → 違規」之間反覆試錯,花掉大量 token。

- **原則 1 改白名單 / 黑名單(三處一致)**:`SKILL.md` 核心原則 1、ADR-0001 第 6 點、`templates/AGENTS.md` 第 6 條同步——
  React prototype **可搬**:JSX 結構與版面階層、表單欄位 / 驗證規則 / 預設值、`columnDefs` 與 `valueFormatter`、互動流程、
  antd 沒有對應的純展示小元件;**不搬**:它的 router 與 layout 外殼、state、API 呼叫與 mock、樣式方案與色碼、
  登入 / 權限 / 錯誤處理 / theme / i18n 實作。搬入的片段仍要過規範,不加來源註解、回報不列清單。
  `spec-to-code.md` 第 2 節放同一張表,並補 columns → `ColDef` / `TableColumnsType`、表單 → `FormField` 的對映
- **`tokens.ts` 加 `table`(`TableTokens`)**:`rowHeight`、`headerHeight`、`headerBg`、`headerFontWeight`、`stripeBg`、
  `hoverBg`、`cellPaddingX`、`spacing`;dark-mode 覆蓋版的 `LIGHT_TOKENS` / `DARK_TOKENS` 各一組。同一組值餵三處:
  antd `Table` 的 component token(`antdTheme.ts` 的 `components.Table`;列高以 `cellPaddingBlock` 逼近,斑馬紋 antd 沒有)、
  `--app-table-*` CSS 變數(`cssVars.ts` 的 `TABLE_CSS_VAR_NAMES`;`CSS_VAR_NAMES` 改為 `Record<FlatTokenKey, string>`)、
  AG Grid Theming API(兩個 `agGridTheme.ts` 變體加 `rowHeight`、`headerHeight`、`headerBackgroundColor`、`headerFontWeight`、
  `oddRowBackgroundColor`、`rowHoverColor`、`cellHorizontalPadding`、`spacing`)
- **ag-grid 規範第 6.1 節「prototype 的表格樣式怎麼對映」**:prototype 不論用 `withParams`、`.ag-*` class 或 `--ag-*` 變數寫,
  各對到 `tokens.table` 哪個欄位一張表;**硬規則:對不到的樣式一律照公版做、列待確認,不試 `.ag-*` 覆寫、不反覆比對截圖**;
  要新參數走「`TableTokens` 加欄位 → `cssVars` → 兩個 `agGridTheme` → `antdTheme`」,屬改公版,列偏離。
  `--ag-*` 變數也明文禁止。README 第 2 節補「prototype 也是 AG Grid 時」只搬 `columnDefs` 與 `withParams` 的值;
  `styling-theme.md` 第 2 節、`dark-mode.md` 第 3 節推導表、`workflow-detail.md` 步驟 3 色票一併補 `table`
- **步驟 5 產後端契約表 `docs/api-contract.md`**:骨架新增 `scripts/gen-api-contract.mjs`(`npm run api-contract`,用專案自己的
  TypeScript compiler API),掃 `src/api/*Api.ts` 與 `src/types/api/` 反向產生:每支端點的方法與路徑(`apiPath('items', id)` →
  `/items/{id}`)、功能、使用畫面、Request(路徑 / body / 其他參數)、Response、預期錯誤與前端處理,以及每個 DTO 的欄位表
  (名稱、型別、必填、JSDoc 說明)。只認公版寫法(`apiClient.<method>(apiPath(...))`),解析不出的 export 列檔尾「未解析的端點」並印
  WARN,不算失敗;產出不帶時間戳,`--check`(`npm run api-contract:check`)比對不一致就以 1 結束
- **端點 JSDoc 約定(`api.md` 新第 7 節)**:第一行功能、`@screen 畫面`、`@error 狀態碼 情境 → 前端處理`;沒寫的狀態碼自動補
  公版共用三列(401 轉登入、403 錯誤卡 / toast、5xx 與斷線)。骨架的 `authApi.ts`、`itemApi.ts` 已照寫,是範本
- **接線**:`SKILL.md` description(改「產出後端 API 契約表」)、步驟 4、步驟 5 指令與檔案索引;`workflow-detail.md` 步驟 4 第 2 項、
  步驟 5 指令與回報第 6 項;`templates/AGENTS.md` 第 9 條(改了端點要重跑)、`templates/README.md`(指令表與「後端」一節);
  `azure-pipelines.yml` 加 `API contract up to date` 步驟、PR 範本與 `git-workflow.md` 自我檢查加一項;
  `check-placeholders` 缺 `docs/api-contract.md` 報 ERROR
- 驗證:基底 lint 0 warning、typecheck、test(18 條)、build 全綠,`gen-api-contract` 產 6 支端點、`--check` 一致、
  Prettier 通過;全選組合(i18n → dark-mode → msw → react-hook-form → ag-grid Enterprise)重組:五份 README 的錨點全部對上,
  lint、typecheck、test(10 檔 46 條)、build 全綠,`ag-grid` chunk 仍為預期的 2.7 MB,契約表與 `--check` 正常,
  非公版寫法的 export 正確列 WARN。本次在 Node 22.22 下驗證(engines 仍為 >=24.22)
- 未做:`backend-api-contract` 配套 skill 改定位為「非公版產生的既有專案補產契約表」,共用同一個腳本與格式,在那個 skill 的 repo 改

## 3.2.0(2026-10-15)

**prototype 輸入不再限定 HTML:UI/UX 交付 React 原始碼也收。** 流程仍是五步,只有步驟 1 的收件與步驟 2 的讀法多一種型態;
輸出完全不變。

- **原則補強(三處一致)**:ADR-0001 新增第 6 點「prototype 是程式碼時,仍然只是設計稿」;`SKILL.md` 核心原則 1 與
  `templates/AGENTS.md` 第 6 條同步——React prototype 的元件、hook、狀態、路由、樣式方案一行都不進 `src/`,
  只擷取 token、畫面清單、欄位、圖示與版面,在骨架上重寫
- **讀 prototype**:`spec-to-code.md` 第 2 節加「React 原始碼」一列(token、畫面、欄位、圖示、版面各去哪裡找)、型態由副檔名
  判斷不另外問、React 原始碼的讀法與對映關係(它的元件 → antd、Tailwind / theme → `tokens.ts`、router → `routes.ts`、
  mock → DTO 草案)
- **放進 repo**:`workflow-detail.md` 步驟 3 原檔統一放 `docs/prototype/<版本>/`;HTML 直接複製,React 原始碼以 tar 排除
  `node_modules`、`dist`、`.git`、lockfile。既有專案加新版本同樣處理
- **骨架排除 `docs/prototype/`**(否則 React 原始碼一放進去 lint 就紅、format 會改寫原檔、它的測試會被跑):
  `eslint.config.js` 與 msw 覆蓋版的 `ignores`、`.oxlintrc.json` 的 `ignorePatterns`、`.prettierignore`、
  `vite.config.ts` 的 `test.exclude`。`tsconfig` 本來就只含 `src`,不用改
- **`check-placeholders`**:`docs/prototype/` 底下的 Markdown 不再當成專案文件檢查 placeholder;`docs/prototype/` 內出現
  `node_modules`、`dist`、`.git` 時報 ERROR
- `SKILL.md` 的 description 與「需要的輸入」改寫,加觸發語「把 UI/UX 的 React prototype 做成公版專案」;
  `dark-mode` README 補一句 React 原始碼的深色通常是第二組 theme 物件或 `[data-theme]` 分支
- 驗證:在骨架 `docs/prototype/` 放入會讓 lint 失敗的 `.tsx`、必定失敗的 `.test.tsx`、帶 placeholder 的 README 與
  `node_modules`,lint / typecheck / test / build 仍全綠、Prettier 不碰它、`check-placeholders` 只報 `node_modules` 那條
- 全選組合(i18n → dark-mode → msw → react-hook-form → ag-grid Enterprise)在 Node 24.22.0 下重跑:五份 README 的錨點全部對上,
  lint 0 warning、typecheck、test(10 檔 46 條)、build 全綠;msw 覆蓋版的 `eslint.config.js` 也含 `docs/prototype`。補上 3.1.0 欠的驗證

## 3.1.0(2026-10-15)

- **Node 24**:骨架與 Skill 的 `engines.node` 從 `>=22.22.0` 改為 `>=24.22.0`(目前的 Active LTS);
  `azure-pipelines.yml` 的 `NodeTool` 改 `24.22.x`,`tooling.md` 第 4 節與 `templates/README.md` 跟著改
- 升級隨 Node 24 解鎖、或只差 patch 的套件:`jsdom` 29 → 30(30 要求 Node ^22.22.2 || ^24.15.0)、`lint-staged` 16 → 17、
  `react` / `react-dom` 19.3.0 → 19.3.1、`@tanstack/react-query` 5.104.2 → 5.104.3;ADR-0016 的範例版本跟著改。
  骨架在 Node 24.22.0 下 `npm ci` + lint / typecheck / test / build 全綠,lint-staged 17 以 `.lintstagedrc.json` 實跑過
- **沒升的 major 與原因**:`typescript` 7(ADR-0016 以 `~` 鎖 minor;升 major 要另開 PR 驗 typescript-eslint 與 Vite 的相容)、
  `@babel/core` 8(`babel-plugin-react-compiler` 1.0.0 仍依賴 `@babel/types` ^7)、`@types/node` 26(與 `engines` 的 Node 24 對齊,維持 24.x)
- 模組套件(`msw` 3.0.3、`ag-grid` 36.2.0、`react-hook-form` 7.90.0)已是最新,engines 都容許 Node 24

### 下一版的選項

- 在 Node 24 下重跑全選組合(本版只驗了基底;模組 README 沒有以 `package.json` 為錨點,版本號變動不影響接線步驟)

## 3.0.1(2026-10-14)

- 新增 `references/legacy-review.md`:拿 Skill 審查公司既有專案的清單(A 已知待補 13 題、B 五個模組、C 基底 15 題、
  D 舊專案較好的做法)與固定的報告格式;每題寫明要查什麼、結果補到 Skill 哪裡。`SKILL.md` 檔案索引與「更新這個 Skill」連過去
- `check-placeholders`:選了模組時,除了 `docs/conventions/<模組>.md`,也檢查模組 ADR 有沒有複製進 `docs/adr/`
  (i18n 0010、msw 0011、ag-grid 0018、react-hook-form 0019;dark-mode 沒有 ADR)
- `SKILL.md`「更新這個 Skill」:**改了基底檔案也要重跑全選組合**——模組 README 的「上一行 / 下一行加」綁著基底檔案現況,
  只改基底不重跑,README 會悄悄對不上
- `ag-grid` 模組規範「待補」加一條:評估改成表格頁才載入 AG Grid(目前每頁都下載 `ag-grid` chunk)
- 修正 2.1.0「待補」節的舊檔名(`data-grid.md`、`forms.md` 在 3.0.0 已搬進模組)

### 下一版的選項

- `scripts/apply-module.mjs`:把模組 README 第 1–3 節的確定性步驟(裝套件、疊檔案、依錨點插入程式碼)寫成腳本,
  找不到錨點就失敗並指出是哪份 README;README 只留說明。可順便做成「全選 / 全不選」的自動驗證

## 3.0.0(2026-10-14)

**破壞性變更:骨架拆成「必選的基底」+「五個可選模組」,收件時一輪問答決定要用哪些。**
基底不含任何可選功能、自己就全綠;選「是」的模組才讀它的 README、疊上它的檔案、規範與 ADR。

- **骨架拆分**:`assets/skeleton/` 只留必選(登入與 session、權限、`theme/tokens.ts`、`DataBoundary`、錯誤處理、路由、
  Zustand、TanStack Query、Vitest、husky + commitlint、Azure DevOps CI、Vite 設定)。可選模組在 `assets/modules/<模組>/`,
  各有 `README.md`(裝套件、疊檔案、逐檔改既有檔案、測試、與其他模組的互動)、`files/`、依前面模組而不同的
  `files.with-<模組>/`(ag-grid 另有 `files.community/`)、`standard.md`、`adr.md`。固定套用順序 i18n → dark-mode → msw →
  react-hook-form → ag-grid
- **選「否」時基底的做法**:i18n → 文案直接寫繁中(系統名稱 `constants/app.ts`、錯誤文案 `utils/describeError.ts`);
  dark-mode → 只有一組 `TOKENS`;msw → 沒有 `dev:mock`,頁面測試 `vi.mock('@/api/*Api')`,假資料 `test/fixtures.ts`、
  錯誤回應 `test/responseError.ts`;react-hook-form → antd `Form.useForm` + `Form.Item name`(含公版登入頁);
  ag-grid → antd `Table`。Item 範例在基底是 antd `Table` + antd `Form` 的最小版,模組提供替換版
- 基底 `package.json` 只留必選依賴,`package-lock.json` 重新產生;`vite.config.ts` 不含 msw plugin 與 `ag-grid` chunk
  (模組 README 寫明要加的片段)。AG Grid 可選 Enterprise 或 Community;`DataGrid` 的主題改由 `useAgGridTheme()` 提供
- **問答流程**:步驟 1 的收件問題與五題模組問題同一輪問完,建議答案全為「是」(AG Grid 建議 Enterprise、prototype 沒給深色時
  建議保留骨架預設);無人值守時全部採用建議。選擇記在 `docs/adr/0022-selected-modules.md`(新範本
  `templates/adr-selected-modules.md`),`AGENTS.md` 範本的「本專案特有規則」連過去
- **ADR 編號**:0022 固定為選用模組,其他專案 ADR 改從 **0023** 起。基線 0001–0019 編號不變,其中 0010、0011、0018、0019
  搬進模組(i18n、msw、ag-grid、react-hook-form);兩份索引 README 的模組列標「(模組:xxx,選用時才有)」
- **規範**:`i18n.md`、`mocking.md` → `msw.md`、`data-grid.md` → `ag-grid.md`、`forms.md` → `react-hook-form.md` 搬進模組;
  新增 `dark-mode.md`(含「從淺色推導」的換算表)。必選規範的範例改成基底寫法,選了模組時的差異寫在同一處;
  `testing.md` 改以 `vi.mock` 為基底寫法,`styling-theme.md` 只剩單一主題
- `templates/AGENTS.md`、`README.md`:技術棧與鐵律中跟模組相關的句子改成「依 docs/adr/0022 填」的 FILL
- `check-placeholders`:解析 0022 的表格(缺 0022 或缺列是 ERROR);0022 與實際疊上的模組、規範檔不一致是 ERROR;
  沒選 i18n 時改查 `APP_NAME`;範例功能檢查依模組多查 MSW handler、`seedItems`、`testItems`、字典 `items`
- 修正:對話框的 antd 表單加 `clearOnDestroy`,關閉後重開是空白的

## 2.1.0(2026-10-14)

公版新增**資料表格(AG Grid Enterprise)**、**表單(React Hook Form)**,並把**沒有權限的畫面**明寫成公版。
三者目前是**初版**:固定「用什麼、從哪裡用」,團隊的實際用法待既有專案審查後補進各規範的「待補」節。

- 骨架新增 `components/common/DataGrid.tsx`(AG Grid 公版包裝:主題跟 `tokens.ts`、文案跟語言、`autoHeight`、欄位預設)、
  `theme/agGridTheme.ts`(Theming API,由 tokens 推導)、`app/agGrid.ts`(`AllEnterpriseModule` 註冊與 `VITE_AG_GRID_LICENSE_KEY`,
  由 `providers.tsx` 呼叫一次);`vite.config.ts` 多一個 `ag-grid` chunk;測試環境關閉欄位虛擬化
- 骨架新增 `components/common/FormField.tsx`(React Hook Form `Controller` ↔ antd `Form.Item`,負責 label 關聯、必填星號、錯誤訊息);
  `ItemCreateDialog` 與公版 `LoginPage` 改用 `useForm` + `FormField`,不再用 `Form.useForm`
- `ItemTable` 改為 `DataGrid` + `ColDef<Item>[]`,狀態與操作欄用儲存格元件(`CustomCellRendererProps`)示範 hook、`<Can>`、`IconButton`
- 新增套件:`ag-grid-community`、`ag-grid-enterprise`、`ag-grid-react`、`@ag-grid-community/locale`、`react-hook-form`
- 新增規範 `standards/data-grid.md`、`standards/forms.md`(規範索引 21 份);`tech-stack.md` 核准清單同步,「不採用」改列
  antd `Table` 與 antd Form 狀態;`components.md` 第 2 節允許泛型公版零件的宣告例外、第 8 / 10 節改寫;
  `auth.md` 新增 4.1「沒有權限的畫面是公版,有三種」;testing、styling-theme、project-structure、i18n 同步
- 新增 ADR-0018(資料表格用 AG Grid)、ADR-0019(表單用 React Hook Form);團隊基線改為 0001–0019,
  **專案 ADR 改從 0020 起**(0020 路由模式、0021 認證方式、其他 0022 起),範本、`check-placeholders`、AGENTS、README 同步
- `test/setup.ts` 的 `asyncUtilTimeout` 3 秒 → 5 秒(AG Grid 冷啟動)

### 待補(既有專案審查後)

- `data-grid.md`(3.0.0 起為 `assets/modules/ag-grid/standard.md`)第 8 節:常用 Enterprise 功能的團隊預設、Server-Side Row Model 寫法、列選取與批次操作、可編輯儲存格、欄位狀態保存、授權金鑰流程
- `forms.md`(3.0.0 起為 `assets/modules/react-hook-form/standard.md`)第 7 節:是否改用 zod + `@hookform/resolvers`、動態列 / 巢狀 / `Select` 選項來自 API / `Upload` 範本、多步驟表單、唯讀模式、欄位版面規則
- 沒有權限的畫面:若既有專案的 403 頁或「停用並說明原因」的做法與骨架不同,改骨架的 `ForbiddenPage` 與 `auth.md` 第 4.1 / 5 節

## 2.0.0(2026-10-14)

範圍改變:規格由 PM 與 UI/UX 提供(SPEC.md + HTML prototype),這個 Skill **只產生前端程式碼**,不再產生規格、任務單、
GLOSSARY、ARCHITECTURE 等文件,也不再接 mattpocock skills 的 `/implement` 流程。

- 流程改為:收件 → 對照 SPEC 與 prototype 列工作清單(`references/spec-to-code.md`)→ 建立骨架(只有新專案)→
  逐畫面產生程式碼與測試 → 全部完成後移除 Item 範例 → 驗證、commit、回報。也支援在公版產生的既有專案加新畫面
- 刪除:`references/prototype-analysis.md`、`scripts/screenshot-prototype.mjs`(與 Playwright 依賴)、
  `templates/` 的 prototype-analysis、prototype-screens、prototype-README、feature-spec、task、tasks-README、
  task-remove-example、api-interface(-auth)、api-checklist、bug-report、GLOSSARY、ARCHITECTURE、agents/
- `templates/AGENTS.md`、`README.md` 改寫:規則指向 `docs/spec/`(SPEC 原檔)與 `docs/prototype/`;
  `check-placeholders` 改檢查這兩個資料夾、兩份專案 ADR、範例功能是否已移除
- **公版登入與 session**(ADR-0017、`standards/login.md`):骨架新增 `pages/Login/`、`stores/useSessionStore.ts`、
  `app/session.ts`(Bearer header + 401 清 session)、`components/auth/RequireAuth.tsx`、`components/layouts/PublicLayout.tsx`、
  `components/layouts/UserMenu.tsx`(使用者姓名 + 登出)、`hooks/useSessionMutations.ts`、`types/api/auth.ts`;
  `POST /auth/login`、`POST /auth/logout` 的 mock 與 `MOCK_LOGIN`(admin / admin);`GET /me` 檢查 token;
  `INVALID_CREDENTIALS` 錯誤 code;測試預設已登入;新增 3 支測試檔(42 個測試)。
  認證方式由專案 ADR 選定(`templates/adr-auth-mode.md` → `docs/adr/0019`),換 SSO 或 cookie 只替換 `authApi.ts`、
  `types/api/auth.ts` 與登入頁的進入方式
- 專案 ADR 編號改從 0018 起:0018 路由模式、0019 認證方式;團隊基線 0001–0017
- **安裝指令**:本機一律 `npm install`,只有 CI(`azure-pipelines.yml`)用 `npm ci`(ADR-0016、tech-stack、tooling、
  AGENTS、README 同步);骨架建立不再需要 `npm install --package-lock-only`
- 規範裡對 `docs/api/`、任務單、規格 scenario 的引用改為「規格(`docs/spec/`)或後端契約」;PR 範本同步
- 新增 `standards/login.md`,規範索引 19 份;ADR-0012 的後果改連到 ADR-0017

### 待補(需要團隊提供)

- 公司登入服務的實際端點與欄位名:目前骨架是 `POST /auth/login` 回 `{ accessToken }`,請改成公司的實際契約後所有新專案一起生效
- 若公司統一走 SSO,把 `login.md` 第 6 節的 SSO 流程做進骨架成為預設

## 1.0.0(2026-10-13)

第一個正式發布版(tag `v1.0.0`),內容與 0.2.0 相同;從這一版開始依語意化版本升版。

## 0.2.0(2026-10-13)

接上 [mattpocock/skills](https://github.com/mattpocock/skills):產出停在「`/implement` 可以直接吃」的狀態。

- `CONTEXT.md` 改名 `GLOSSARY.md`(格式本來就相同;`domain-modeling`、`tdd`、`wait-what` 讀這個檔名),所有交叉引用一併改
- 任務單加「狀態」列(`ready-for-agent` / `in-progress` / `needs-human` / `done`)、「分支」列、「測試 seam」與「待確認」節;
  新增 `docs/tasks/README.md` 索引範本。`docs/tasks/` 就是 local issue tracker
- 新增 `templates/agents/`(`issue-tracker.md`、`domain.md`),`AGENTS.md` 範本加 `## Agent skills` 與「測試 seam」兩節;
  專案不需要再跑 `/setup-matt-pocock-skills`
- prototype 原檔改為**進版控**(`docs/prototype/`),ADR-0001 與骨架 `.gitignore` 同步;新增 `scripts/screenshot-prototype.mjs` +
  `templates/prototype-screens.json`,步驟 2 為每個畫面產 `docs/prototype/screens/<id>[-dark].png`,任務單「參考畫面」直接連圖
- Skill 根目錄加 `package.json`(Playwright、Prettier 是 Skill 自己的 devDependency,不進骨架)
- 停頓點改成 `grilling` 的分輪問法(frontier、每題附建議答案、事實自己查)
- `check-placeholders` 新增:任務單狀態列、參考畫面存在、沒有截圖時警告
- `task-remove-example` 的驗收不再引用 `<skill>` 路徑
- `SKILL.md` 新增「接 mattpocock skills」對照表;明確**不用** `/to-spec`、`/to-tickets`,`/implement-spec` 可用但未試跑

### 已知限制(新增)

- 截圖腳本只試過單檔 HTML prototype;多頁 HTML 用 `hash` 以外的方式開啟時要自己在 `screens.json` 寫 `click` 步驟
- `/implement` 的整段流程(骨架 → 第一張任務 → tdd → code-review)尚未在真實專案跑過一輪

## 0.1.0(2026-10-13)

第一版。以 erd-cowork-frontend 為底稿萃取,依團隊 13 項決議調整。

- 骨架:React 19 + React Compiler、Vite 8、TypeScript 6 strict、Ant Design 6、React Router 8、
  TanStack Query 5、Zustand 5、Axios、Vitest 5 + Testing Library + MSW 3
- 目錄按「層」分;lint 強制分層(no-restricted-imports)、禁止 `../`、禁止 any、正式程式碼不得依賴 mock
- 讀取 `useSuspenseQuery` + 每窗格 `DataBoundary`;寫入 `useActionMutation`
- 角色權限骨架:`permissions.ts`、`usePermission`、`RequirePermission`、`<Can>`、選單依權限過濾
- 內建 typed i18n 字典與兩支守門測試(noBareLiterals、errorCodeCoverage)
- 開發期 MSW(`npm run dev:mock`),`pendingHandlers` / `shippedHandlers` 分流;正式建置不含 mock
- 路由模式由專案收件時決定(ADR 0017 範本)
- CI:Azure DevOps Pipelines;PR 範本;commitlint(Conventional Commits)
- 版本策略:`^` + lockfile + `npm ci`
- 文件:18 份規範、16 份 ADR、README / AGENTS / ARCHITECTURE / CONTEXT / 規格 / 任務單 / API 契約範本

### 已知限制

- 只用一個參考專案萃取;第二個參考專案提供後應比對修正
- 元件內宣告順序、不寫死色碼、無障礙規則仍靠 review(沒有對應 lint)
- react-hooks / React Compiler 規則為 warning,不會擋 CI

### 試跑修正(兩次無人值守試跑:會議室預約系統,history 與 hash 各一次)

- 步驟順序:空資料夾檢查移到步驟 1;分析檔寫在專案的 `docs/_bootstrap/` 不算既有內容
- 骨架首頁改名 `home`,補「prototype 沒有首頁」的完整清理步驟;新增頁面最小測試範本 `HomePage.test.tsx`
- 不在選單上的頁面改放 `app/subPages.tsx`,避免 `only-export-components` 警告
- lockfile 名稱同步(`npm install --package-lock-only --ignore-scripts`),檢查腳本一併檢查
- 新增 `api-interface-auth.md`(`GET /me`);api-checklist 的 mock 欄加「未建立」
- 收件加問英文名稱與 prototype 的團隊共享位置;外殼差異一律開任務單
- 無人值守:沒有建議答案的問題寫「待確認」照常繼續;完成後做第一次 commit
- 所有 Markdown 先以骨架的 Prettier 設定格式化,commit 時 lint-staged 不會再改寫團隊規範
