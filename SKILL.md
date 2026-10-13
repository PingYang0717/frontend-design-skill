---
name: frontend-project-bootstrap
description: 拿到 UI/UX prototype 要開始一個新的前端專案時使用:依團隊標準(React 19 + Ant Design + TanStack Query + Zustand,按層分的目錄)建立可執行的專案骨架,並依 prototype 填好 README、AGENTS.md、ARCHITECTURE、GLOSSARY、API 契約草案、BDD 規格、任務單與畫面截圖,停在「任務可以派給 coding agent(/implement)」的狀態。也用於「建立團隊標準前端專案」「新專案套用前端公版」。不用於修改既有專案。
---

# Frontend Project Bootstrap

把 UI/UX 交付的 prototype 轉成「團隊標準的前端專案 + 填好的文件 + 可開工的任務單」,讓之後不同人、不同 coding agent
寫出的程式碼像同一個人寫的。

版本:見 `CHANGELOG.md` 最上面一筆。

## 核心原則

1. **prototype 是需求素材,不是要搬進專案的程式碼。** 從它擷取畫面、資料、色票與互動,不複製它的實作;原檔與截圖進 repo 當驗收標準。
2. **團隊規範原樣複製,專案內容依 prototype 填寫。** 兩類檔案的處理方式不同(見下方「檔案索引」)。
3. **不確定就問,不要猜。** 問題在停頓點分輪問,每題附建議答案;「是」就代表接受建議。
4. **不實作業務功能。** 這個 Skill 只建立骨架、空白頁面與文件;業務功能之後依任務單由 `/implement` 開發。
5. **驗證才算完成。** lint、typecheck、test、build 全綠,沒有殘留的 placeholder,每個畫面都有截圖。

## 需要的輸入

- prototype(單一 HTML、多頁 HTML、設計檔連結或截圖)與它的版本 / 交付日期
- 專案名稱與一句話說明
- 新專案的資料夾位置(必須是空資料夾或新 repo;**已有內容時先停下來確認**)

其餘資訊(部署環境、後端現況、語系、深色模式)在步驟 1 詢問;細節見 `references/workflow-detail.md`。

## 事前準備(每台機器一次)

```bash
cd <skill> && npm ci && npx playwright install chromium   # scripts/ 用的 Playwright 與 Prettier;不進專案骨架
# 機器上已有 Chromium 時可不下載,跑截圖腳本時改用 CHROMIUM_EXECUTABLE=<路徑>
```

## 流程

建立任務清單追蹤以下五步,每步完成就勾掉。

### 步驟 1:收件

先確認專案資料夾不存在或是空的(有內容就停下來問)。再確認 prototype 檔案、版本與團隊共享的存放位置,
詢問 `references/workflow-detail.md` 步驟 1 表格中**訊息裡還沒提供的**項目。

### 步驟 2:分析 prototype 與截圖

讀 `references/prototype-analysis.md`,依它的方法分析,產出 `docs/_bootstrap/prototype-analysis.md`
(格式:`templates/prototype-analysis.md`)。prototype 是 HTML 時,同時把原檔放進 `docs/prototype/`、
填 `docs/prototype/screens.json`(格式:`templates/prototype-screens.json`),跑截圖腳本產出每個畫面的 png。

**⏸ 停頓點:** 依 `references/prototype-analysis.md` 的「停頓點」分輪提問:待確認問題、缺漏狀態的預設做法、
路由模式(history / hash)、後端現況。收到回答後記入分析檔第 11、12 節再繼續。

### 步驟 3:建立骨架

複製 `assets/skeleton/`(排除 `node_modules`),`npm ci`,然後依 `references/workflow-detail.md` 步驟 3
修改名稱、色票、路由模式、路由與選單、空白頁面、權限代碼。保留 Item 範例功能到第一個真實功能完成。

### 步驟 4:產出文件

依 `references/workflow-detail.md` 步驟 4 的對照表複製與填寫。所有 `<!-- FILL: -->` 依其指示填完並刪除註解,
所有 `{{PLACEHOLDER}}` 替換。不知道的寫「待確認」,不編造。

### 步驟 5:驗證、commit 與回報

```bash
npm run lint && npm run typecheck && npm test && npm run build
node <skill>/scripts/check-placeholders.mjs <project>
```

四項全綠(lint 沒有 warning)、檢查腳本 0 個 ERROR 才算完成;接著做第一次 commit。
回報格式見 `references/workflow-detail.md` 步驟 5。

使用者不在場時:有建議答案的採用建議並標記「採用建議(暫定)」,沒有建議答案的寫「待確認」,照常繼續;
兩者都列在回報裡。唯一要停下的情況是專案資料夾已有內容。

## 檔案索引

### 原樣複製(只能替換名稱,不得改寫內容)

| 路徑                       | 複製到              | 內容                                                                                                                       |
| -------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `assets/skeleton/`         | 專案根目錄          | 可執行骨架:設定檔、api 層、資料 hook、DataBoundary、權限、i18n、theme、MSW、測試、CI(Azure DevOps)、PR 範本、Item 範例功能 |
| `references/standards/`    | `docs/conventions/` | 18 份團隊開發規範 + 索引                                                                                                   |
| `references/adr-baseline/` | `docs/adr/`         | ADR 0001–0016 + 索引                                                                                                       |
| `templates/agents/`        | `docs/agents/`      | mattpocock skills 的 tracker 與 domain docs 設定(local markdown、single-context)                                           |

### 依 prototype 填寫

| 範本                                                                      | 產出                                                                  |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `templates/prototype-analysis.md`                                         | `docs/_bootstrap/prototype-analysis.md`                               |
| `templates/prototype-screens.json`                                        | `docs/prototype/screens.json`(截圖腳本輸入)                           |
| `templates/README.md`、`AGENTS.md`、`ARCHITECTURE.md`、`GLOSSARY.md`      | 專案根目錄                                                            |
| `templates/CLAUDE.md`                                                     | 專案根目錄(Claude Code 的轉接檔:一行說明註解加 `@AGENTS.md`,原樣複製) |
| `templates/prototype-README.md`                                           | `docs/prototype/README.md`                                            |
| `templates/adr-router-mode.md`                                            | `docs/adr/0017-router-mode.md`                                        |
| `templates/api-interface-auth.md`、`api-interface.md`、`api-checklist.md` | `docs/api/`                                                           |
| `templates/feature-spec.md`                                               | `docs/specs/<feature>.md`                                             |
| `templates/task.md`、`tasks-README.md`、`task-remove-example.md`          | `docs/tasks/`                                                         |
| `templates/adr.md`、`bug-report.md` 等                                    | 另存一份到 `docs/templates/` 給之後使用                               |

### 說明與工具

| 路徑                               | 什麼時候讀                       |
| ---------------------------------- | -------------------------------- |
| `references/workflow-detail.md`    | 每一步的具體做法、指令與檔案對照 |
| `references/prototype-analysis.md` | 步驟 2                           |
| `scripts/screenshot-prototype.mjs` | 步驟 2(prototype 改版也重跑)     |
| `scripts/check-placeholders.mjs`   | 步驟 5                           |

## 接 mattpocock skills

這個 Skill 的產出就是 [mattpocock/skills](https://github.com/mattpocock/skills) 的輸入;專案不需要再跑 `/setup-matt-pocock-skills`
(跑了也只會原地更新 `AGENTS.md` 的 `## Agent skills` 與 `docs/agents/`,不要讓它寫進 `CLAUDE.md`)。

| 它的 skill                     | 對應到這裡                                                                                                  |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `/grill-with-docs`、`grilling` | 步驟 2 的停頓點是同一種訪談;之後要改設計時直接用它,名詞落在 `GLOSSARY.md`、決策落在 `docs/adr/0018+`        |
| `domain-modeling`              | 讀寫 `GLOSSARY.md`(格式相同)與 `docs/adr/`(團隊格式,見 `docs/agents/domain.md`)                             |
| `/to-spec`、`/to-tickets`      | **不用**。規格已是 `docs/specs/`(Gherkin 編號),任務已是 `docs/tasks/`(帶分層檔案路徑與可重用元件)           |
| `/implement`                   | 第一版的實作方式:一次一張 `docs/tasks/<ID>-*.md`,從 `main` 開任務單寫的分支;它會呼叫 `tdd` 與 `code-review` |
| `tdd`                          | seam 已寫在 `AGENTS.md`「測試 seam」,不用再議                                                               |
| `/implement-spec`              | 可用但未試跑:每個 worktree 都要 `npm ci`(husky `prepare`),Azure DevOps 沒有 draft PR 整合                   |

## Agent 工具相容性

`AGENTS.md` 是唯一的規則來源。opencode 與 Kimi Code CLI 直接讀專案根目錄的 `AGENTS.md`;
Claude Code 讀 `CLAUDE.md`,所以骨架附一個只有 `@AGENTS.md` 的轉接檔。不要在轉接檔另寫規則。

## 更新這個 Skill

團隊規範要改就改這個 Skill(standards、adr-baseline、skeleton 一起改),在 `CHANGELOG.md` 記錄並升版;
不要只在個別專案裡改。個別專案的偏離寫成該專案的 ADR(0017 起)。
修改 skeleton 後一定要在 `assets/skeleton/` 跑一次 lint、typecheck、test、build;修改 Markdown 後跑 `npm run format`。
