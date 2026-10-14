---
name: frontend-project-bootstrap
description: 拿到 PM 的 SPEC(Markdown)與 UI/UX 的 HTML prototype,要產生前端程式碼時使用:依團隊標準建立專案骨架,再依 SPEC 逐畫面實作功能與測試,直到 lint / typecheck / test / build 全綠。必選:React 19 + Ant Design + TanStack Query + Zustand + 公版登入與權限;可選:i18n、MSW、AG Grid、React Hook Form、深色模式,收件時問答決定。也用於「依規格產生前端程式碼」「建立團隊標準前端專案」「新專案套用前端公版」「在公版專案加新畫面」。不產生規格、任務單等文件;規格由 PM 與 UI/UX 提供。
---

# Frontend Project Bootstrap

輸入是 PM 的 **SPEC.md** 與 UI/UX 的 **HTML prototype**,輸出是**可執行、全綠的前端程式碼**:
讓不同人、不同 coding agent 依同一份規格寫出的程式碼像同一個人寫的,登入、權限、錯誤處理等每個專案都一樣的
東西直接沿用公版,不重做。

版本:見 `CHANGELOG.md` 最上面一筆。

## 核心原則

1. **SPEC 是需求,prototype 是視覺驗收標準,兩者都不是程式碼。** 從 prototype 擷取畫面、色票、互動;不複製它的實作。
   原檔都放進 repo(`docs/spec/`、`docs/prototype/`)。
2. **公版原樣複製,專案內容依 SPEC 實作。** 基底、選用的模組、規範、ADR、登入與權限機制只能替換名稱與 token,不得改寫;
   要偏離就寫專案 ADR(0023 起)。
3. **基底 + 可選模組。** 骨架本身不含任何可選功能;收件時一輪問答決定五個模組,選「是」才讀該模組的 README、疊上它的檔案。
4. **SPEC 沒說的不要猜。** 擋住寫程式的缺口一輪問完(每題附建議答案);不擋的寫進回報的「待確認」照常做。
5. **一個畫面一個切片,做完就驗。** 依「加一個新功能」的分層順序實作,每個畫面做完就跑 lint / typecheck / test。
6. **全綠才算完成。** lint(0 warning)、typecheck、test、build 全過,沒有殘留的 placeholder,範例功能已移除。

## 需要的輸入

- SPEC.md(PM):畫面、欄位、行為、角色與權限;有 API 契約更好。最少要有什麼見 `references/spec-to-code.md` 第 1 節
- prototype(UI/UX):HTML(單檔或多頁)與版本 / 交付日期
- 專案資料夾:新專案是空資料夾;既有專案必須是這個 Skill 產生的(根目錄有 `AGENTS.md` 且 `docs/conventions/` 存在)

其餘資訊(專案名稱、認證方式、路由模式、後端現況、要用哪些模組)SPEC 沒寫才在步驟 1 問。

## 流程

建立任務清單追蹤以下五步,每步完成就勾掉。

### 步驟 1:收件與選模組

確認 SPEC、prototype 與專案資料夾(新專案要是空的;既有專案要是公版產生的,否則停下來問)。
讀完整份 SPEC 與 prototype,再**一輪問完**:`references/workflow-detail.md` 步驟 1 的收件問題(SPEC 與訊息都沒提供的)
與五題模組問題放在同一輪。每題編號、一句背景、選項、建議答案;回「是」代表接受建議。

| 模組              | 選「否」時基底用什麼                                        | 選「是」還要追問                               |
| ----------------- | ----------------------------------------------------------- | ---------------------------------------------- |
| `i18n`            | 文案直接寫繁中字串,沒有字典與兩支守門測試                   | 不追問                                         |
| `dark-mode`       | 只有一組 `TOKENS`,沒有 `useThemeStore` 與主題切換           | prototype 沒給深色時:保留骨架預設 / 從淺色推導 |
| `msw`             | 沒有 `dev:mock`;頁面測試以 `vi.mock('@/api/*Api')` 換掉 API | 不追問                                         |
| `react-hook-form` | 表單(含公版登入頁)用 antd `Form.useForm` + `Form.Item name` | 不追問                                         |
| `ag-grid`         | 表格用 antd `Table`                                         | Enterprise / Community                         |

建議答案全部為「是」;AG Grid 建議 Enterprise;深色模式在 prototype 沒給深色時建議「保留骨架預設」。
SPEC 或訊息已明確說了(例如「不做多語系」)就不問。選擇記在 `docs/adr/0022-selected-modules.md`(步驟 3 建立)。
既有專案不問模組題,讀它的 `docs/adr/0022-selected-modules.md`。

### 步驟 2:對照 SPEC 與 prototype,列出工作清單

依 `references/spec-to-code.md` 把 SPEC 轉成程式碼清單:畫面 → 路由與選單、角色 → 權限代碼、欄位 → DTO、
動作 → 端點與 mutation、prototype → token 與元件對映、行為 → 測試案例。清單放在任務清單裡,不產生文件。

**⏸ 停頓點(只在有缺口時):** 擋住寫程式的缺口(權限矩陣、欄位型別、端點形狀、prototype 缺的畫面)一輪問完,
每題附建議答案;「是」就代表接受建議。

### 步驟 3:建立骨架(只有新專案)

複製 `assets/skeleton/`(排除 `node_modules`),`npm install`;**依選擇疊上模組**:照固定順序
i18n → dark-mode → msw → react-hook-form → ag-grid,逐一讀 `assets/modules/<模組>/README.md` 照做
(裝套件、疊 `files/` 與變體、改既有檔案、複製規範與 ADR)。接著依 `references/workflow-detail.md` 步驟 3 設定名稱、
色票、路由模式、認證方式,寫 `docs/adr/0022`,放入 SPEC 與 prototype 原檔。既有專案跳過這一步。

### 步驟 4:依 SPEC 產生程式碼

每個畫面依 `references/workflow-detail.md` 步驟 4 的分層順序實作:DTO → endpoint → (msw)mock → hook → 元件 → 頁面 →
路由 / 選單 / 權限 → (i18n)字典 → 測試。登入、權限、錯誤處理、主題一律用骨架既有機制;表格、表單、文案、測試的假後端
**依所選模組**:選了就用模組的機制(`DataGrid`、`FormField`、字典、MSW),沒選就用基底的做法(antd `Table`、antd `Form`、
繁中字串、`vi.mock`),不另寫第三套。全部畫面完成後移除骨架的 Item 範例功能。

### 步驟 5:驗證、commit 與回報

```bash
npm run lint && npm run typecheck && npm test && npm run build
node <skill>/scripts/check-placeholders.mjs <project>
```

四項全綠(lint 沒有 warning)、檢查腳本 0 個 ERROR 才算完成;接著 commit。回報格式見 `references/workflow-detail.md` 步驟 5。

使用者不在場時:有建議答案的採用建議並標記「採用建議(暫定)」(模組全選、AG Grid Enterprise、專案名稱用預設),
沒有建議答案的寫「待確認」,照常繼續;兩者都列在回報裡。唯一要停下的情況是專案資料夾有內容卻不是公版產生的。

## 檔案索引

### 原樣複製(只能替換名稱,不得改寫內容)

| 路徑                       | 複製到              | 內容                                                                                                                                           |
| -------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets/skeleton/`         | 專案根目錄          | 基底:設定檔、api 層、資料 hook、DataBoundary、**登入與 session**、**權限**、theme、Vitest、CI(Azure DevOps)、PR 範本、Item 範例功能;自己就全綠 |
| `references/standards/`    | `docs/conventions/` | 必選的團隊開發規範 + 索引(模組規範由模組提供)                                                                                                  |
| `references/adr-baseline/` | `docs/adr/`         | 必選的基線 ADR + 索引(模組 ADR 由模組提供,編號不變)                                                                                            |
| `templates/CLAUDE.md`      | 專案根目錄          | Claude Code 的轉接檔:只有 `@AGENTS.md`                                                                                                         |

### 可選模組(`assets/modules/<模組>/`)

| 模組              | 內容                                                                 | 規範 → `docs/conventions/` | ADR → `docs/adr/`                               |
| ----------------- | -------------------------------------------------------------------- | -------------------------- | ----------------------------------------------- |
| `i18n`            | typed 字典(zhTW / en)、語言切換、兩支守門測試                        | `i18n.md`                  | `0010-ui-copy-in-typed-dictionary.md`           |
| `dark-mode`       | 淺色 / 深色 token、`useThemeStore`、header 主題切換                  | `dark-mode.md`             | 無                                              |
| `msw`             | `src/mocks/`、`dev:mock`、以 MSW 為假後端的測試                      | `msw.md`                   | `0011-dev-mocks-removed-when-endpoint-ships.md` |
| `react-hook-form` | `FormField`、登入頁與 Item 對話框的 React Hook Form 版               | `react-hook-form.md`       | `0019-react-hook-form-for-forms.md`             |
| `ag-grid`         | `DataGrid`、`agGrid.ts`、`agGridTheme.ts`、`ItemTable` 的 AG Grid 版 | `ag-grid.md`               | `0018-ag-grid-for-data-tables.md`               |

每個模組有 `README.md`(接線步驟)、`files/`(與專案路徑同結構,可覆蓋基底同名檔案)、依前面模組而不同的
`files.with-<模組>/`、`standard.md`、`adr.md`。

### 依 SPEC 填寫

| 範本                                | 產出                                                         |
| ----------------------------------- | ------------------------------------------------------------ |
| `templates/AGENTS.md`               | 專案根目錄:coding agent 的規則,與模組相關的句子依 0022 填    |
| `templates/README.md`               | 專案根目錄:名稱、啟動方式、路由表、後端、待確認              |
| `templates/adr-router-mode.md`      | `docs/adr/0020-router-mode.md`                               |
| `templates/adr-auth-mode.md`        | `docs/adr/0021-auth-mode.md`                                 |
| `templates/adr-selected-modules.md` | `docs/adr/0022-selected-modules.md`:一列一模組的固定表格     |
| `templates/adr.md`                  | 其他偏離團隊標準的決定(0023 起);另存一份到 `docs/templates/` |

### 公版的登入與權限

這兩塊每個專案都一樣,SPEC 只決定「有哪些權限代碼」與「用哪種認證方式」:

| 需求              | 公版位置                                                                                                                                                | 規範                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 登入頁、登出、401 | `src/pages/Login/`、`src/stores/useSessionStore.ts`、`src/app/session.ts`、`src/components/auth/RequireAuth.tsx`、`src/components/layouts/UserMenu.tsx` | `references/standards/login.md` |
| 換認證方式        | 只改 `src/types/api/auth.ts`、`src/api/authApi.ts`(選了 msw 還有 `src/mocks/handlers.ts`);寫 `docs/adr/0021-auth-mode.md`                               | `login.md` 第 6 節              |
| 頁面與按鈕的權限  | `src/constants/permissions.ts`、`navEntries.tsx` 的 `permission`、`<Can>`、`RequirePermission`                                                          | `references/standards/auth.md`  |
| 沒有權限的畫面    | 整頁 → `src/pages/Forbidden/ForbiddenPage.tsx`;區塊 → `<Can fallback>`;後端 403 → 窗格錯誤卡。只改文案與 token                                          | `auth.md` 第 4.1 節             |

### 說明與工具

| 路徑                              | 什麼時候讀                        |
| --------------------------------- | --------------------------------- |
| `references/workflow-detail.md`   | 每一步的具體做法、指令與檔案對照  |
| `references/spec-to-code.md`      | 步驟 2;SPEC 最少要有什麼          |
| `assets/modules/<模組>/README.md` | 步驟 3,選了該模組時               |
| `references/standards/`           | 步驟 4 寫程式時,碰到哪一層讀哪份  |
| `scripts/check-placeholders.mjs`  | 步驟 5                            |
| `references/legacy-review.md`     | 維護者拿 Skill 審查公司既有專案時 |

## Agent 工具相容性

`AGENTS.md` 是唯一的規則來源。opencode 與 Kimi Code CLI 直接讀專案根目錄的 `AGENTS.md`;
Claude Code 讀 `CLAUDE.md`,所以骨架附一個只有 `@AGENTS.md` 的轉接檔。不要在轉接檔另寫規則。

## 更新這個 Skill

維護者每台機器一次:`cd <skill> && npm install`(只有 Prettier,格式化 Skill 自己的 Markdown;不進專案骨架)。

團隊規範要改就改這個 Skill(standards、adr-baseline、skeleton、modules 一起改),在 `CHANGELOG.md` 記錄並升版;
不要只在個別專案裡改。登入與權限的畫面或流程要變,改骨架,讓所有新專案一起變。
個別專案的偏離寫成該專案的 ADR(0023 起)。
修改 skeleton 後一定要在 `assets/skeleton/` 跑一次 lint、typecheck、test、build;修改模組後至少驗證全選與全不選兩個組合
(做法見 `references/workflow-detail.md` 步驟 3);修改 Markdown 後跑 `npm run format`。

**改了基底檔案也要重跑全選組合。** 模組 README 的「在 X 的上一行 / 下一行加」是對著基底檔案現在的內容寫的
(尤其 `src/app/providers.tsx`、`vite.config.ts`、`vite-env.d.ts`、`.env.example`、`src/constants/storage.ts`、
`src/components/layouts/AppHeader.tsx`、PR 範本)。只改基底、不重跑全選,五份 README 可能悄悄對不上,要到下一個新專案才發現。
找不到錨點的那一行就是要同步修改的 README。

**舊專案審查:** 拿這個 Skill 去比對公司既有專案時,照 `references/legacy-review.md` 做,產出固定格式的報告,
再依報告把結果補進對應的規範、模組與骨架。
