---
name: frontend-project-bootstrap
description: 拿到 PM 的 SPEC(Markdown)與 UI/UX 的 HTML prototype,要產生前端程式碼時使用:依團隊標準(React 19 + Ant Design + AG Grid Enterprise 表格 + React Hook Form 表單 + TanStack Query + Zustand,按層分的目錄,公版登入與權限)建立專案骨架,再依 SPEC 逐畫面實作功能與測試,直到 lint / typecheck / test / build 全綠。也用於「依規格產生前端程式碼」「建立團隊標準前端專案」「新專案套用前端公版」「在公版專案加新畫面」。不產生規格、任務單等文件;規格由 PM 與 UI/UX 提供。
---

# Frontend Project Bootstrap

輸入是 PM 的 **SPEC.md** 與 UI/UX 的 **HTML prototype**,輸出是**可執行、全綠的前端程式碼**:
讓不同人、不同 coding agent 依同一份規格寫出的程式碼像同一個人寫的,登入、權限、錯誤處理等每個專案都一樣的
東西直接沿用公版,不重做。

版本:見 `CHANGELOG.md` 最上面一筆。

## 核心原則

1. **SPEC 是需求,prototype 是視覺驗收標準,兩者都不是程式碼。** 從 prototype 擷取畫面、色票、互動;不複製它的實作。
   原檔都放進 repo(`docs/spec/`、`docs/prototype/`)。
2. **公版原樣複製,專案內容依 SPEC 實作。** 骨架、規範、ADR、登入與權限機制只能替換名稱與 token,不得改寫;
   要偏離就寫專案 ADR(0020 起)。
3. **SPEC 沒說的不要猜。** 擋住寫程式的缺口一輪問完(每題附建議答案);不擋的寫進回報的「待確認」照常做。
4. **一個畫面一個切片,做完就驗。** 依「加一個新功能」的分層順序實作,每個畫面做完就跑 lint / typecheck / test。
5. **全綠才算完成。** lint(0 warning)、typecheck、test、build 全過,沒有殘留的 placeholder,範例功能已移除。

## 需要的輸入

- SPEC.md(PM):畫面、欄位、行為、角色與權限;有 API 契約更好。最少要有什麼見 `references/spec-to-code.md` 第 1 節
- prototype(UI/UX):HTML(單檔或多頁)與版本 / 交付日期
- 專案資料夾:新專案是空資料夾;既有專案必須是這個 Skill 產生的(根目錄有 `AGENTS.md` 且 `docs/conventions/` 存在)

其餘資訊(認證方式、路由模式、後端現況、深色模式、多語系)SPEC 沒寫才在步驟 1 問。

## 事前準備(每台機器一次)

```bash
cd <skill> && npm install   # 只有 Prettier(格式化 Skill 自己的 Markdown);不進專案骨架
```

## 流程

建立任務清單追蹤以下五步,每步完成就勾掉。

### 步驟 1:收件

確認 SPEC、prototype 與專案資料夾(新專案要是空的;既有專案要是公版產生的,否則停下來問)。
讀完整份 SPEC 與 prototype。只問 `references/workflow-detail.md` 步驟 1 表格中 **SPEC 與訊息都沒提供的**項目。

### 步驟 2:對照 SPEC 與 prototype,列出工作清單

依 `references/spec-to-code.md` 把 SPEC 轉成程式碼清單:畫面 → 路由與選單、角色 → 權限代碼、欄位 → DTO、
動作 → 端點與 mutation、prototype → token 與元件對映、行為 → 測試案例。清單放在任務清單裡,不產生文件。

**⏸ 停頓點(只在有缺口時):** 擋住寫程式的缺口(權限矩陣、欄位型別、端點形狀、prototype 缺的畫面)一輪問完,
每題附建議答案;「是」就代表接受建議。

### 步驟 3:建立骨架(只有新專案)

複製 `assets/skeleton/`(排除 `node_modules`),`npm install`,依 `references/workflow-detail.md` 步驟 3 設定名稱、
色票、路由模式、認證方式,複製規範與 ADR,放入 SPEC 與 prototype 原檔。既有專案跳過這一步。

### 步驟 4:依 SPEC 產生程式碼

每個畫面依 `references/workflow-detail.md` 步驟 4 的分層順序實作:DTO → endpoint → mock → hook → 元件 → 頁面 →
路由 / 選單 / 權限 → 字典 → 測試。登入、權限、錯誤處理、i18n、主題、表格(`DataGrid`)、表單(`FormField`)一律用骨架既有機制,不另寫。
全部畫面完成後移除骨架的 Item 範例功能。

### 步驟 5:驗證、commit 與回報

```bash
npm run lint && npm run typecheck && npm test && npm run build
node <skill>/scripts/check-placeholders.mjs <project>
```

四項全綠(lint 沒有 warning)、檢查腳本 0 個 ERROR 才算完成;接著 commit。回報格式見 `references/workflow-detail.md` 步驟 5。

使用者不在場時:有建議答案的採用建議並標記「採用建議(暫定)」,沒有建議答案的寫「待確認」,照常繼續;
兩者都列在回報裡。唯一要停下的情況是專案資料夾有內容卻不是公版產生的。

## 檔案索引

### 原樣複製(只能替換名稱,不得改寫內容)

| 路徑                       | 複製到              | 內容                                                                                                                                                                                                      |
| -------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets/skeleton/`         | 專案根目錄          | 可執行骨架:設定檔、api 層、資料 hook、DataBoundary、**登入與 session**、**權限**、**DataGrid(AG Grid)**、**FormField(React Hook Form)**、i18n、theme、MSW、測試、CI(Azure DevOps)、PR 範本、Item 範例功能 |
| `references/standards/`    | `docs/conventions/` | 21 份團隊開發規範 + 索引                                                                                                                                                                                  |
| `references/adr-baseline/` | `docs/adr/`         | ADR 0001–0019 + 索引                                                                                                                                                                                      |
| `templates/CLAUDE.md`      | 專案根目錄          | Claude Code 的轉接檔:只有 `@AGENTS.md`                                                                                                                                                                    |

### 依 SPEC 填寫

| 範本                           | 產出                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| `templates/AGENTS.md`          | 專案根目錄:coding agent 的規則,專案特有規則只有 ADR 連結     |
| `templates/README.md`          | 專案根目錄:名稱、啟動方式、路由表、後端、待確認              |
| `templates/adr-router-mode.md` | `docs/adr/0020-router-mode.md`                               |
| `templates/adr-auth-mode.md`   | `docs/adr/0021-auth-mode.md`                                 |
| `templates/adr.md`             | 其他偏離團隊標準的決定(0022 起);另存一份到 `docs/templates/` |

### 公版的登入與權限

這兩塊每個專案都一樣,SPEC 只決定「有哪些權限代碼」與「用哪種認證方式」:

| 需求              | 公版位置                                                                                                                                                | 規範                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 登入頁、登出、401 | `src/pages/Login/`、`src/stores/useSessionStore.ts`、`src/app/session.ts`、`src/components/auth/RequireAuth.tsx`、`src/components/layouts/UserMenu.tsx` | `references/standards/login.md` |
| 換認證方式        | 只改 `src/types/api/auth.ts`、`src/api/authApi.ts`、`src/mocks/handlers.ts`;寫 `docs/adr/0021-auth-mode.md`                                             | `login.md` 第 6 節              |
| 頁面與按鈕的權限  | `src/constants/permissions.ts`、`navEntries.tsx` 的 `permission`、`<Can>`、`RequirePermission`                                                          | `references/standards/auth.md`  |
| 沒有權限的畫面    | 整頁 → `src/pages/Forbidden/ForbiddenPage.tsx`;區塊 → `<Can fallback>`;後端 403 → 窗格錯誤卡。只改文案與 token                                          | `auth.md` 第 4.1 節             |

### 公版的表格與表單

| 需求     | 公版位置                                                                                                                  | 規範                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 資料表格 | `src/components/common/DataGrid.tsx`(AG Grid Enterprise)、`src/theme/agGridTheme.ts`、`src/app/agGrid.ts`(模組與授權金鑰) | `references/standards/data-grid.md` |
| 表單     | `src/components/common/FormField.tsx`(React Hook Form ↔ antd)                                                             | `references/standards/forms.md`     |

這兩份規範目前是**初版**:用什麼、從哪裡用已固定;Enterprise 功能的團隊預設、Server-Side Row Model、zod schema、
複雜欄位的寫法標在各檔「待補」節,待既有專案審查後補上。

### 說明與工具

| 路徑                             | 什麼時候讀                       |
| -------------------------------- | -------------------------------- |
| `references/workflow-detail.md`  | 每一步的具體做法、指令與檔案對照 |
| `references/spec-to-code.md`     | 步驟 2;SPEC 最少要有什麼         |
| `references/standards/`          | 步驟 4 寫程式時,碰到哪一層讀哪份 |
| `scripts/check-placeholders.mjs` | 步驟 5                           |

## Agent 工具相容性

`AGENTS.md` 是唯一的規則來源。opencode 與 Kimi Code CLI 直接讀專案根目錄的 `AGENTS.md`;
Claude Code 讀 `CLAUDE.md`,所以骨架附一個只有 `@AGENTS.md` 的轉接檔。不要在轉接檔另寫規則。

## 更新這個 Skill

團隊規範要改就改這個 Skill(standards、adr-baseline、skeleton 一起改),在 `CHANGELOG.md` 記錄並升版;
不要只在個別專案裡改。登入與權限的畫面或流程要變,改骨架,讓所有新專案一起變。
個別專案的偏離寫成該專案的 ADR(0020 起)。
修改 skeleton 後一定要在 `assets/skeleton/` 跑一次 lint、typecheck、test、build;修改 Markdown 後跑 `npm run format`。
