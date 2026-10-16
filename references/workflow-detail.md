# 套用流程細節

`SKILL.md` 列出步驟與停頓點;這份補上每一步的具體做法。`<skill>` 指這個 Skill 的根目錄,`<project>` 指專案根目錄。

## 步驟 1:收件與選模組

**先檢查 `<project>`**:

- 不存在或是空的 → 新專案,步驟 3 會建立骨架
- 根目錄有 `AGENTS.md` 且 `docs/conventions/` 存在 → 公版產生的既有專案,跳過步驟 3,只加新畫面;
  模組依它的 `docs/adr/0022-selected-modules.md`,不再問
- 有其他內容 → **停下來**問使用者(無人值守時停止並回報),這個 Skill 不處理非公版專案

prototype 的型態(HTML 單檔 / 多頁 HTML / React 原始碼)由副檔名判斷,不問;讀法見 `spec-to-code.md` 第 2 節。
讀完整份 SPEC 與 prototype 後,下面兩張表**同一輪**問完,只問 SPEC 與訊息都沒提供的。
每題編號、一句背景、選項、建議答案;使用者回「是」代表接受建議。

**收件問題**

| 問題                                                                       | 用途                                                                          | 沒有答案時的預設                                                                                                                              |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 專案名稱:中文顯示名、英文顯示名、slug(英文小寫 kebab-case)                 | `package.json` name、`<title>`、系統名稱(字典 `app.name` 或 `APP_NAME`)       | slug 用專案資料夾名;中文顯示名用 SPEC 標題;英文顯示名用 slug 轉 Title Case(`room-booking` → `Room Booking`)。三者都標「暫定」,列入回報第 1 項 |
| 認證方式:帳密登入回 token / SSO 跳轉 / gateway cookie;登入服務的端點與欄位 | `docs/adr/0021-auth-mode.md`、`types/api/auth.ts`、`api/authApi.ts`           | 骨架預設(帳密 + Bearer token)                                                                                                                 |
| 部署環境:能否設定伺服器 fallback、是否部署在子路徑                         | `docs/adr/0020-router-mode.md`                                                | history                                                                                                                                       |
| 後端現況:已有 / 開發中 / 未開始;有無 API 文件                              | DTO 是否標草案;選了 msw 時的 mock 範圍(`pendingHandlers` / `shippedHandlers`) | 未開始:全部走 `pendingHandlers`                                                                                                               |

**模組問題**(背景一句話寫「選否時基底用什麼」,見 `SKILL.md` 步驟 1 的表)

| 題目                                             | 建議答案 | 追問(選「是」時)                                                         |
| ------------------------------------------------ | -------- | ------------------------------------------------------------------------ |
| 要不要多語系(`i18n`)?                            | 是       | 無。英文字典型別要求填滿;SPEC 沒要求英文時照填,列待確認                  |
| 要不要深色模式(`dark-mode`)?                     | 是       | prototype 沒給深色時:保留骨架預設(建議)/ 從淺色推導;prototype 有給就不問 |
| 要不要 MSW 假後端(`msw`,`dev:mock` 與測試用)?    | 是       | 無                                                                       |
| 表單要不要用 React Hook Form(`react-hook-form`)? | 是       | 無                                                                       |
| 表格要不要用 AG Grid(`ag-grid`)?                 | 是       | Enterprise(建議)/ Community                                              |

SPEC 或訊息已明確說了的(例如「不做多語系」「表格用 antd 即可」)不問,直接依它決定,理由寫「SPEC 指定」。

## 步驟 2:對照 SPEC 與 prototype

依 `references/spec-to-code.md` 列出工作清單(放任務清單)。有擋住寫程式的缺口才停下來問,一輪問完。

## 步驟 3:建立骨架(只有新專案)

```bash
mkdir -p <project> && cd <project>
tar -C <skill>/assets/skeleton --exclude=node_modules --exclude=dist -cf - . | tar -xf -   # 有 rsync 也可以 rsync -a --exclude
git init                       # 若還不是 git repo
npm pkg set name=<slug>
npm install                    # 依 lockfile 安裝,順便把 lockfile 的 name 跟著改;prepare 會裝 husky hook
mkdir -p docs/spec docs/prototype/<版本> docs/templates   # 例如 docs/prototype/v1.0/
cp <SPEC> docs/spec/            # 檔名帶版本或日期,例如 spec-v1.0.md
cp <prototype>.html docs/prototype/<版本>/   # HTML 單檔或多頁:直接複製
tar -C <prototype> --exclude=node_modules --exclude=dist --exclude=.git --exclude=package-lock.json -cf - . \
  | tar -C docs/prototype/<版本> -xf -       # React 原始碼:只放原始碼,不放依賴與產物
cp -R <skill>/references/standards docs/conventions
cp -R <skill>/references/adr-baseline docs/adr
cp <skill>/templates/CLAUDE.md <skill>/templates/AGENTS.md <skill>/templates/README.md ./   # AGENTS、README 在第 8 點填寫
cp <skill>/templates/adr.md docs/templates/
```

骨架的 lint、format 與測試設定已排除 `docs/prototype/`(`eslint.config.js`、`.oxlintrc.json`、`.prettierignore`、
`vite.config.ts` 的 `test.exclude`),React 原始碼放進去不會被檢查或改寫;不要為了它再改其他設定。

**疊上模組**:依固定順序 **i18n → dark-mode → msw → react-hook-form → ag-grid**,對每個選「是」的模組讀
`<skill>/assets/modules/<模組>/README.md`,照它的第 1–3、6 節做完(裝套件、疊 `files/` 與適用的變體、改既有檔案、
複製規範與 ADR),再換下一個。每疊完一個跑 `npm run lint && npm run typecheck && npm test`。

- 變體:`files.with-<前面的模組>/` 只在那個模組有選時疊;ag-grid 選 Community 時還要疊 `files.community/`
- 選「否」的模組什麼都不做;把 `docs/conventions/README.md`、`docs/adr/README.md` 裡標「(模組:xxx,選用時才有)」的
  那幾列刪掉,選「是」的模組把標記刪掉、保留列
- 寫 `docs/adr/0022-selected-modules.md`(範本 `templates/adr-selected-modules.md`):一列一模組,「是否採用」只寫「是」或「否」

接著依序修改(每改完一批就跑 `npm run lint && npm run typecheck && npm test`):

1. **名稱**:`index.html` 的 `<title>` → 中文顯示名;選了 i18n → `src/i18n/zhTW.ts`、`en.ts` 的 `app.name` →
   中文 / 英文顯示名;沒選 → `src/constants/app.ts` 的 `APP_NAME` → 中文顯示名
2. **色票**:`src/theme/tokens.ts` 依 prototype 逐值替換(沒選 dark-mode 是 `TOKENS`,選了是 `LIGHT_TOKENS` 與 `DARK_TOKENS`)。
   `DARK_TOKENS`:prototype 有深色就照抄,沒有就依 0022 的細項(保留骨架預設 / 依 `dark-mode.md` 第 3 節推導);
   只給部分深色值時,有給的照抄,沒給的維持骨架預設。prototype 有表格時 `table`(列高、表頭、斑馬紋、hover、內距)
   一併填;對不到 `TableTokens` 欄位的表格樣式列待確認,不寫 CSS 覆寫(`styling-theme.md` 第 2 節)
3. **路由模式**:history 維持 `createBrowserRouter`;hash 改 `createHashRouter` 並新增 `src/utils/appHref.ts`
   (寫法見 `docs/conventions/routing.md`)。填 `templates/adr-router-mode.md` → `docs/adr/0020-router-mode.md`
4. **認證方式**:依 `docs/conventions/login.md` 第 6 節。骨架預設只需把 `src/types/api/auth.ts`、`src/api/authApi.ts`
   (選了 msw 還有 `src/mocks/handlers.ts`)的端點路徑與欄位名對齊公司登入服務;SSO 或 cookie 依表格替換。
   填 `templates/adr-auth-mode.md` → `docs/adr/0021-auth-mode.md`。**登入頁、`useSessionStore`、`app/session.ts`、
   `RequireAuth`、`UserMenu` 不改**
5. **權限代碼**:`src/constants/permissions.ts` 依權限矩陣建立全部代碼;測試用的使用者給齊所有權限
   (選了 msw 是 `src/mocks/db.ts` 的 `seedUser()`,沒選是 `src/test/fixtures.ts` 的 `TEST_USER`)
6. **首頁**:prototype 有首頁 → 把 `pages/Home/HomePage.tsx` 改成該畫面(步驟 4 實作);沒有首頁 → 先完成步驟 4 的
   第一個畫面,再刪 `pages/Home/`、`navEntries.tsx` 與 `navPages.tsx` 的 `home`(選了 i18n 還有字典的 `nav.home` 與 `pages.home`),
   在 `app/routes.tsx` 的 `RootLayout` children 最前面加 `{ index: true, element: <Navigate to={ROUTES.<第一個畫面>} replace /> }`,
   並把 `RequirePermission.test.tsx`、`LoginPage.test.tsx` 中斷言首頁文字的地方改成第一個畫面。`ROUTES.home` 保留為 `'/'`
7. **選用模組紀錄**:確認 `docs/adr/0022-selected-modules.md` 與實際疊上的模組一致
8. **文件**:填專案根目錄的 `AGENTS.md`、`README.md`(所有 `<!-- FILL: -->` 填完刪掉註解,`{{PLACEHOLDER}}` 全部替換;
   標「依 docs/adr/0022」的 FILL 依選擇擇一保留;不知道的寫「待確認」,不編造)

既有專案:新畫面需要的權限代碼加進 `permissions.ts`;新的 SPEC 與 prototype 版本放進 `docs/spec/`、`docs/prototype/<版本>/`
(React 原始碼同樣排除 `node_modules`、`dist`、lockfile)。

## 步驟 4:依 SPEC 產生程式碼

每個畫面一個切片,依 `docs/conventions/project-structure.md` 第 4 節的順序。括號是只有選了該模組才做的步驟:

1. `types/api/<資源>.ts`:DTO 與 request 型別,與契約逐字一致;沒有契約就依 SPEC 欄位提草案,檔案註解標「草案」
2. `api/<資源>Api.ts`:每個端點一個函式,`apiPath()` 組路徑,清單用 `expectArray()`;每個函式寫 JSDoc(第一行功能、
   `@screen 畫面`、`@error 狀態碼 情境 → 前端處理`;`api.md` 第 7 節),步驟 5 的契約表從這裡來
3. (msw)`mocks/handlers.ts` 的 `pendingHandlers` + `mocks/db.ts` 的 `seedXxx()`;後端已上線的端點放 `shippedHandlers`。
   沒選 msw:`src/test/fixtures.ts` 加這個資源的假資料
4. `hooks/use<資源>.ts`(`queryOptions` + `useSuspenseQuery`)、`hooks/use<資源>Mutations.ts`(`useActionMutation` + invalidate)
5. `components/<domain>/`:元件從 hook 拿資料;表格用 `DataGrid`(ag-grid)或 antd `Table`;表單用 `FormField`(react-hook-form)
   或 antd `Form.Item name`;寫入按鈕包 `<Can>`;刪除走 `useConfirmDestructive`;純圖示按鈕用 `IconButton`
6. `pages/<Name>/<Name>Page.tsx`:只組裝、放 `DataBoundary`、讀寫 URL state
7. `constants/routes.ts` → `navEntries.tsx`(設 `permission`)→ `navPages.tsx`;不在選單的頁面 → `subPages.tsx` + `routes.tsx`
8. (i18n)`i18n/zhTW.ts`、`en.ts`:所有文案、aria-label;新錯誤 code 進 `types/api/error.ts` 與 `errors.byCode`。
   沒選 i18n:文案直接寫繁中;新錯誤 code 進 `types/api/error.ts` 與 `utils/describeError.ts` 的 `ERROR_COPY_BY_CODE`
9. `pages/<Name>/<Name>Page.test.tsx`:SPEC 的每個行為與缺漏狀態一個 `it`,`renderApp('/路徑')` 進入;
   假後端是 MSW(msw)或 `vi.mock('@/api/<資源>Api')`;斷言引用字典(i18n)或直接寫繁中
10. `npm run lint && npm run typecheck && npm test`

寫法以 `docs/conventions/` 為準;骨架的 Item 範例(`itemApi.ts`、`useItems.ts`、`ItemTable.tsx`、`ItemsPage.tsx`、
`ItemsPage.test.tsx`)已是所選模組的版本,是每一層的樣板,照著寫。

規則提醒:

- 登入、登出、401、權限守衛、錯誤卡、toast、主題一律用骨架既有機制;表格、表單、文案、假後端依 0022 用模組或基底的做法。
  **不要**為某個畫面另寫一套,也不要混用(選了 ag-grid 就不再用 antd `Table`)
- 顏色只用 `theme/tokens.ts` 的 token;圖示只用 `@ant-design/icons`
- 不新增套件(包含沒選的模組的套件);真的需要時停下來問,並在 `docs/conventions/tech-stack.md` 的流程下記錄
- 外殼(header、側欄)與 prototype 不同時最後處理;登入頁只調 token 與文案,不改結構
- 與 prototype 或 SPEC 不一致、做不到的地方列入回報的「偏離」與「待確認」,不默默改掉

**全部畫面完成後,移除 Item 範例功能:**

1. 刪除 `src/types/api/item.ts`、`src/api/itemApi.ts`、`src/hooks/useItems.ts`、`src/hooks/useItemMutations.ts`、
   `src/components/items/`、`src/pages/Items/`
2. `navEntries.tsx` 移除 `items` 入口與 `NavKey` 的 `'items'`;`navPages.tsx` 移除 `items`;`routes.ts` 移除 `items`
3. `permissions.ts` 移除 `itemsRead`、`itemsWrite`(真實功能沒有沿用時);測試使用者(`db.ts` 的 `seedUser()` 或
   `fixtures.ts` 的 `TEST_USER`)同步
4. (i18n)字典移除 `items` 區塊與 `nav.items`;(msw)`handlers.ts`、`db.ts` 移除 items 的 handler 與 `seedItems`;
   沒選 msw:`fixtures.ts` 移除 `testItems`
5. `RequirePermission.test.tsx`、`RequireAuth.test.tsx` 改用真實功能的路由、權限與資料
6. `grep -rE "itemApi|useItems|useItemMutations|ItemTable|ItemCreateDialog|ItemsPage|itemsRead|itemsWrite|seedItem|testItems" src`
   應為空;最終以 `check-placeholders` 第 5 項(範例功能)為準。四項檢查全綠

## 步驟 5:驗證、產契約表、commit 與回報

```bash
cd <project>
npm run lint && npm run typecheck && npm test && npm run build
npm run api-contract                       # 產 docs/api-contract.md;WARN 列的是不是公版寫法的端點
node <skill>/scripts/check-placeholders.mjs .
```

- 四個指令全綠(lint 不得有 warning);`api-contract` 的 WARN 逐一處理(改回 `apiClient` + `apiPath` 的寫法再重跑);
  `check-placeholders` 0 個 ERROR
- 翻一次 `docs/api-contract.md`:每支端點的「功能」與「使用畫面」都有填(空的回去補 JSDoc)、DTO 草案的欄位已標在說明欄
- 實際開一次:選了 msw 用 `npm run dev:mock` 以 `MOCK_LOGIN`(admin / admin)登入,沒選用 `npm run dev` 接後端;
  選了 dark-mode 時淺色、深色各看過一次每個畫面
- 全部通過後 commit(訊息需符合 commitlint):新專案
  `git add -A && git commit -m "feat: 依 <SPEC 版本> 建立專案(frontend-project-bootstrap v<版本>)"`;
  既有專案依畫面分 commit,`feat(<domain>): <畫面>`
- 回報給使用者:
  1. 暫定決定(使用者沒回答而採用建議的項目,含專案名稱與模組選擇),放最上面
  2. 完成的畫面清單:路由、權限、測試數
  3. 偏離 prototype 或 SPEC 的地方與原因
  4. 仍待確認的問題(含 DTO 草案、找不到對應圖示、缺的畫面)
  5. 下一步:驗收方式;選了 msw 時,後端上線後把對應 handler 搬到 `shippedHandlers`
  6. 後端契約表:`docs/api-contract.md`,N 支端點;有 WARN 時列出哪些 export 未解析

## 無人值守時

使用者不在(排程執行或已說明晚點回來):

- 有建議答案或預設的問題(含專案名稱):採用建議,在回報標記「採用建議(暫定)」
- 模組全部採用建議:五個全選、AG Grid Enterprise、prototype 沒給深色時保留骨架預設;0022 的「理由」寫「採用建議(暫定)」
- 沒有建議答案的問題(登入服務端點、聯絡窗口、環境網址):寫「待確認」,照常繼續
- 兩者都列在最後回報裡(前者放第 1 項,後者放第 4 項)
- 唯一會停下來的情況:步驟 1 發現 `<project>` 有內容卻不是公版產生的
