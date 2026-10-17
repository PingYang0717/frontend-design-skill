# 舊專案審查清單

拿這個 Skill 去比對公司既有的前端專案,找出「Skill 寫的」和「團隊實際在做的」哪裡不同。給審查的 agent(或人)用;
審查只產出報告,**不修改 Skill 也不修改被審的專案**。報告交給 Skill 維護者,依每題的「補到哪裡」改 Skill 並升版。

## 怎麼做

1. 一次審一個專案。先讀這個 Skill 的 `SKILL.md`、`references/standards/README.md`、`assets/modules/*/README.md`,
   知道 Skill 目前的寫法。
2. 依下面的題目逐題查被審專案。**查證據,不憑印象**:每個結論附檔案路徑與出現次數(`grep -rn` 的結果即可)。
3. 寫報告 `legacy-review-<專案名>.md`,格式見最後一節。查不到的題目寫「沒有用到」,不要略過。
4. 有兩個以上專案時,每個專案各一份報告;維護者比對多份後才決定團隊預設,單一專案的做法不直接變成規則。

每題的判斷只有四種:

| 判斷       | 意思                                                          |
| ---------- | ------------------------------------------------------------- |
| 一致       | 舊專案與 Skill 寫法相同                                       |
| 不同       | 兩邊都有做,但做法不同(寫清楚舊專案怎麼做、哪個比較好、為什麼) |
| Skill 缺   | 舊專案有、Skill 沒寫(需要補範本或規則)                        |
| 舊專案沒有 | Skill 有、舊專案沒做                                          |

## A. 待補項目(Skill 已知的缺口,優先查)

| #   | 查什麼                                                                                               | 補到哪裡                                                                |
| --- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| A1  | AG Grid 用到哪些 Enterprise 功能:分組 / 樞紐、側欄、狀態列、範圍選取、Excel 匯出;各自的設定值        | `assets/modules/ag-grid/standard.md` 第 8 節、`DataGrid.tsx`            |
| A2  | AG Grid 用 Client-Side 還是 Server-Side Row Model;後端分頁時參數怎麼對應 API、怎麼和資料抓取接起來   | 同上                                                                    |
| A3  | 表格的列選取與批次操作(勾選後刪除、匯出、改狀態)怎麼寫                                               | 同上                                                                    |
| A4  | 儲存格能不能直接編輯;編輯後怎麼存回後端、失敗怎麼還原                                                | 同上、`references/adr-baseline/0015-*`                                  |
| A5  | 欄寬、欄位順序、排序有沒有記住;存在哪裡(localStorage、後端)                                          | 同上                                                                    |
| A6  | AG Grid 授權金鑰放哪裡、怎麼取得、誰負責續約;是否所有專案都用 Enterprise                             | 同上、`assets/modules/ag-grid/README.md` 細項                           |
| A7  | AG Grid 在哪裡註冊、是否只在表格頁才載入;首屏時間或使用者網路環境有沒有相關抱怨                      | `assets/modules/ag-grid/standard.md` 第 8 節最後一條                    |
| A8  | 表單驗證用 React Hook Form 的 `rules` 還是 zod / yup schema;schema 放哪裡、和 API 型別的關係         | `assets/modules/react-hook-form/standard.md` 第 7 節                    |
| A9  | 動態欄位(`useFieldArray`)、巢狀物件、下拉選項來自 API、檔案上傳的寫法                                | 同上                                                                    |
| A10 | 多步驟表單、草稿暫存、離開頁面前「尚未儲存」提示                                                     | 同上                                                                    |
| A11 | 檢視與編輯共用同一個表單的寫法;欄位排版規則(label 寬度、兩欄、對話框寬度)                            | 同上                                                                    |
| A12 | 有沒有細粒度權限;403 頁長什麼樣、有沒有「按鈕停用並說明原因」而不是隱藏;後端回 403 時畫面怎麼呈現    | 模組 `permissions/standard.md` 第 4.1、5 節                             |
| A13 | 公司登入 SDK 怎麼接;閘門(公司網路、系統權限)後端回什麼狀態碼或 code;遮罩用哪個公司元件、props 是什麼 | `references/standards/access.md`、骨架 `accessGate.ts`、`companyUi.tsx` |

## B. 六個可選模組

每個模組先回答「舊專案有沒有用、用了幾個專案」,這決定收件時的建議答案。

| #   | 模組            | 查什麼                                                                                | 補到哪裡                                    |
| --- | --------------- | ------------------------------------------------------------------------------------- | ------------------------------------------- |
| B1  | i18n            | 有沒有多語系;用 i18next 之類的函式庫還是自建字典;文案 key 的命名;是否有漏翻的檢查     | `assets/modules/i18n/`、建議答案            |
| B2  | dark-mode       | 有沒有深色模式;顏色怎麼切換(antd algorithm、CSS 變數、兩套 token);是否記住使用者選擇  | `assets/modules/dark-mode/`、建議答案       |
| B3  | msw             | 後端還沒好時怎麼開發(MSW、json-server、寫死假資料);測試怎麼模擬 API                   | `assets/modules/msw/`、`testing.md`         |
| B4  | react-hook-form | 表單用 React Hook Form、antd Form 還是混用;混用時各占多少、有沒有因此出 bug           | `assets/modules/react-hook-form/`、建議答案 |
| B5  | ag-grid         | 表格用 AG Grid、antd Table 還是混用;有沒有自己包一層共用元件;主題與 antd 顏色是否一致 | `assets/modules/ag-grid/`、建議答案         |

## C. 基底(每個專案都有的部分)

| #   | 主題       | 查什麼                                                                                    | 補到哪裡                                               |
| --- | ---------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| C1  | 套件       | `package.json` 的執行期依賴:有哪些不在 `tech-stack.md` 核准清單、為什麼用                 | `references/standards/tech-stack.md`                   |
| C2  | 目錄結構   | 依「層」還是依「功能」分資料夾;元件、hook、API 各放哪                                     | `project-structure.md`、ADR-0002                       |
| C3  | API 層     | HTTP client 怎麼包、interceptor 做什麼、DTO 型別放哪、是否有欄位轉換層                    | `api.md`、ADR-0003、ADR-0006                           |
| C4  | 資料抓取   | TanStack Query 的寫法(`useQuery` / `useSuspenseQuery`)、query key 命名、寫入後怎麼更新    | `data-fetching.md`、ADR-0005                           |
| C5  | 狀態管理   | 全域狀態用什麼;伺服器資料有沒有放進全域 store;篩選與分頁放 URL 還是 state                 | `state-management.md`、ADR-0004                        |
| C6  | 錯誤處理   | 讀取失敗與寫入失敗各怎麼呈現;錯誤文案來自後端 `message` 還是前端                          | `error-handling.md`、ADR-0006、ADR-0007                |
| C7  | 權限       | 有沒有細粒度權限;有的話代碼從哪來、選單與路由怎麼過濾、按鈕怎麼藏                         | 模組 `permissions/standard.md`、ADR-0012               |
| C8  | 路由       | history 還是 hash、部署在子路徑嗎、頁面是否 lazy 載入                                     | `routing.md`、`templates/adr-router-mode.md`           |
| C9  | 樣式與主題 | 顏色從哪來(token、寫死色碼、CSS 檔);CSS Modules、styled-components 還是 Tailwind;圖示庫   | `styling-theme.md`、ADR-0001                           |
| C10 | 元件寫法   | `function` 還是 arrow function、`React.FC`、export 方式、是否手寫 `useMemo`/`useCallback` | `components.md`、ADR-0008、ADR-0009                    |
| C11 | 測試       | 測試工具、測什麼(頁面還是元件)、有沒有 E2E、覆蓋率要求                                    | `testing.md`                                           |
| C12 | 工具與 CI  | lint 規則、Prettier 設定、commit 格式、CI 平台與檢查項目                                  | `tooling.md`、`git-workflow.md`、`azure-pipelines.yml` |
| C13 | 無障礙     | 純圖示按鈕有沒有 `aria-label`、表單有沒有 label 關聯                                      | `accessibility.md`、ADR-0014                           |
| C14 | 版本與安裝 | Node 版本、lockfile 是否進版控、本機與 CI 的安裝指令                                      | `tech-stack.md` 第 3 節、ADR-0016                      |
| C15 | 共用元件   | 舊專案自己寫了哪些多處重用的元件(搜尋框、確認框、狀態標籤、空狀態),哪些值得收進骨架       | `components.md` 第 8 節、`components/common/`          |

## D. 舊專案做得比 Skill 好的地方

不限主題,列出舊專案裡值得收進 Skill 的做法:解決了什麼問題、在哪些檔案、收進 Skill 要改哪裡。

## 報告格式

```markdown
# 舊專案審查:<專案名>

- 審查的 commit:<hash>
- 對照的 Skill 版本:<CHANGELOG 最上面的版本>
- 審查者:<agent 或人>

## 摘要

- 最該改的 3–5 件事(各一句,附題號)

## A. 待補項目

### A1 AG Grid Enterprise 功能

- 判斷:一致 / 不同 / Skill 缺 / 舊專案沒有
- 舊專案的做法:<一兩句>
- 證據:`src/xxx/Foo.tsx:42`、`grep -rn "enableRangeSelection" src | wc -l` → 12
- 建議:<要不要改 Skill、改成什麼;不確定就寫「需要團隊決定」並列出選項>

(B、C 每題同上格式;D 自由列點)
```

**寫報告的規則**

- 每題都要有「證據」,沒有證據的判斷不算數。
- 「建議」只寫要改 Skill 的哪個檔案、改成什麼,不要直接改。
- 需要團隊拍板的(例如「全公司統一用 zod」),寫「需要團隊決定」並列出選項與各自的代價。
- 舊專案的帳號、金鑰、內部網址不要抄進報告。

## E. 3.x 公版專案升到 4.0

4.0 把登入與權限從基底拆掉(ADR-0017 改寫、ADR-0012 變成 permissions 模組),3.x 產的專案不能直接用 4.0 的 Skill 加畫面
(`check-placeholders` 會找 `docs/adr/0021-access-gate.md`、`docs/api-contract.md`)。升級照下面做,每步跑 lint / typecheck / test:

1. **刪登入**:`pages/Login/`、`stores/useSessionStore.ts`、`hooks/useSessionMutations.ts`、`components/auth/RequireAuth.tsx`(+ 測試)、
   `components/layouts/PublicLayout.tsx`、`components/layouts/UserMenu.tsx`(+ 測試)、`types/api/auth.ts`、`api/authApi.ts`、`app/session.ts`;
   選了 msw 的刪 `handlers.ts` 的 `/auth/*`、`/me` 與 `db.ts` 的 `MOCK_LOGIN`、`MOCK_ACCESS_TOKEN`、`currentUser`;
   選了 i18n 的刪字典 `pages.login`、`header.logout`、`errors.byCode.INVALID_CREDENTIALS`;`KNOWN_ERROR_CODES` 拿掉 `INVALID_CREDENTIALS`
2. **接閘門**:從 4.0 骨架複製 `app/accessGate.ts`、`stores/useAccessStore.ts`、`components/common/AccessMask.tsx`(+ 測試)、
   `vendor/companyUi.tsx` + `.module.css`、`test/companyUiStub.tsx`;`api/apiClient.ts` 改成 4.0 版(cookie、沒有 header provider);
   `main.tsx` 與 `test/setup.ts` 的 `connectSession()` 改 `connectAccessGate()`,setup 加 `vi.mock('@/vendor/companyUi', …)` 與 `useAccessStore.reset()`;
   `providers.tsx` 在 `<AntdApp>` 裡放 `<AccessMask />`;`routes.tsx` 拿掉 `PublicLayout` 區域與 `RequireAuth`;`ROUTES` 刪 `login`
3. **權限二選一**:
   - 專案其實不需要細粒度權限(多數):刪 `constants/permissions.ts`、`hooks/usePermission.ts`、`hooks/useCurrentUser.ts`、
     `components/auth/`、`pages/Forbidden/`、`types/api/user.ts`;`navEntries` 拿掉 `permission`、`AppShell` 拿掉過濾、`routes.tsx` 拿掉包裝與 403;
     所有 `<Can>` 解開;0022 加 `permissions | 否`
   - 需要:改成 permissions 模組——`hooks/useCurrentUser.ts` 換成模組的 `hooks/usePermission.ts` + `api/permissionApi.ts`
     (權限清單的 API 收件時確認,不再是 `/me`);`<Can>` 全部改名 `<RequirePermission>`、路由層加 `onDenied="redirect"`;
     `components/auth/RequirePermission.tsx` 換成模組版;0022 加 `permissions | 是 | <API>`;`docs/conventions/auth.md` 換成 `permissions.md`
4. **文件**:`docs/conventions/login.md` 換 `access.md`、`docs/adr/0017` 換新版、`docs/adr/0021-auth-mode.md` 改寫成 `0021-access-gate.md`
   (範本 `templates/adr-access-gate.md`)、`AGENTS.md` 第 7 條與資料夾速查、`README.md` 的路由表與「後端」一節、PR 範本的自我檢查;
   `docs/conventions/README.md`、`docs/adr/README.md` 索引同步
5. **契約表**(3.2 以前的專案):複製 `scripts/gen-api-contract.mjs`、加兩個 npm script、CI 加 `api-contract:check`、`npm run api-contract`
6. `node <skill>/scripts/check-placeholders.mjs .` 0 個 ERROR;全綠後一個 commit:`chore: 升級公版至 4.0.0(存取閘門、permissions 模組)`
