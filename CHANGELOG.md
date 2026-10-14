# CHANGELOG

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

- `data-grid.md` 第 8 節:常用 Enterprise 功能的團隊預設、Server-Side Row Model 寫法、列選取與批次操作、可編輯儲存格、欄位狀態保存、授權金鑰流程
- `forms.md` 第 7 節:是否改用 zod + `@hookform/resolvers`、動態列 / 巢狀 / `Select` 選項來自 API / `Upload` 範本、多步驟表單、唯讀模式、欄位版面規則
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
