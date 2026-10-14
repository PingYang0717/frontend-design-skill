# 套用流程細節

`SKILL.md` 列出步驟與停頓點;這份補上每一步的具體做法。`<skill>` 指這個 Skill 的根目錄,`<project>` 指專案根目錄。

## 步驟 1:收件

**先檢查 `<project>`**:

- 不存在或是空的 → 新專案,步驟 3 會建立骨架
- 根目錄有 `AGENTS.md` 且 `docs/conventions/` 存在 → 公版產生的既有專案,跳過步驟 3,只加新畫面
- 有其他內容 → **停下來**問使用者(無人值守時停止並回報),這個 Skill 不處理非公版專案

讀完整份 SPEC 與 prototype 後,只問 SPEC 與訊息都沒提供的:

| 問題                                                                       | 用途                                                                                                                | 沒有答案時的預設                       |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 專案名稱:中文顯示名、英文顯示名、slug(英文小寫 kebab-case)                 | `package.json` name、`<title>`、字典 `app.name`。沒有英文名時用 slug 轉 Title Case(`room-booking` → `Room Booking`) | 問,不預設                              |
| 認證方式:帳密登入回 token / SSO 跳轉 / gateway cookie;登入服務的端點與欄位 | `docs/adr/0021-auth-mode.md`、`types/api/auth.ts`、`api/authApi.ts`                                                 | 骨架預設(帳密 + Bearer token)          |
| 部署環境:能否設定伺服器 fallback、是否部署在子路徑                         | `docs/adr/0020-router-mode.md`                                                                                      | history                                |
| 後端現況:已有 / 開發中 / 未開始;有無 API 文件                              | DTO 是否標草案、mock 範圍(`pendingHandlers` / `shippedHandlers`)                                                    | 未開始:全部走 `pendingHandlers`        |
| 是否需要多語系                                                             | 英文字典是否要認真翻譯(型別仍要求填滿)                                                                              | 只做繁中,英文字典照填                  |
| 是否需要深色模式                                                           | `DARK_TOKENS` 是否逐值填                                                                                            | prototype 沒給就保留骨架預設並列待確認 |

## 步驟 2:對照 SPEC 與 prototype

依 `references/spec-to-code.md` 列出工作清單(放任務清單)。有擋住寫程式的缺口才停下來問,一輪問完。

## 步驟 3:建立骨架(只有新專案)

```bash
rsync -a --exclude node_modules --exclude dist <skill>/assets/skeleton/ <project>/   # 沒有 rsync 用 cp -R 後刪 node_modules
cd <project>
git init                       # 若還不是 git repo
npm pkg set name=<slug>
npm install                    # 依 lockfile 安裝,順便把 lockfile 的 name 跟著改;prepare 會裝 husky hook
mkdir -p docs/spec docs/prototype docs/templates
cp <SPEC> docs/spec/            # 檔名帶版本或日期,例如 spec-v1.0.md
cp <prototype> docs/prototype/  # 例如 prototype-v1.0.html
cp -R <skill>/references/standards docs/conventions
cp -R <skill>/references/adr-baseline docs/adr
cp <skill>/templates/CLAUDE.md <skill>/templates/adr.md ./   # adr.md 之後移到 docs/templates/
mv adr.md docs/templates/adr.md
```

接著依序修改(每改完一批就跑 `npm run lint && npm run typecheck && npm test`):

1. **名稱**:`index.html` 的 `<title>` → 中文顯示名;`src/i18n/zhTW.ts`、`en.ts` 的 `app.name` → 中文 / 英文顯示名
2. **色票**:`src/theme/tokens.ts` 的 `LIGHT_TOKENS` / `DARK_TOKENS` 依 prototype 逐值替換。prototype 沒提供深色時
   保留骨架預設;只提供部分深色值時,有給的照抄,沒給的維持 `...LIGHT_TOKENS` 繼承(seed token 兩主題同值,由 antd 推導)
3. **路由模式**:history 維持 `createBrowserRouter`;hash 改 `createHashRouter` 並新增 `src/utils/appHref.ts`
   (寫法見 `docs/conventions/routing.md`)。填 `templates/adr-router-mode.md` → `docs/adr/0020-router-mode.md`
4. **認證方式**:依 `docs/conventions/login.md` 第 6 節。骨架預設只需把 `src/types/api/auth.ts`、`src/api/authApi.ts`、
   `src/mocks/handlers.ts` 的端點路徑與欄位名對齊公司登入服務;SSO 或 cookie 依表格替換。
   填 `templates/adr-auth-mode.md` → `docs/adr/0021-auth-mode.md`。**登入頁、`useSessionStore`、`app/session.ts`、
   `RequireAuth`、`UserMenu` 不改**
5. **權限代碼**:`src/constants/permissions.ts` 依權限矩陣建立全部代碼;`src/mocks/db.ts` 的 `seedUser()` 給齊所有權限
6. **首頁**:prototype 有首頁 → 把 `pages/Home/HomePage.tsx` 改成該畫面(步驟 4 實作);沒有首頁 → 先完成步驟 4 的
   第一個畫面,再刪 `pages/Home/`、`navEntries.tsx` 與 `navPages.tsx` 的 `home`、字典的 `nav.home` 與 `pages.home`,
   在 `app/routes.tsx` 的 `RootLayout` children 最前面加 `{ index: true, element: <Navigate to={ROUTES.<第一個畫面>} replace /> }`,
   並把 `RequirePermission.test.tsx`、`LoginPage.test.tsx` 中斷言首頁文字的地方改成第一個畫面。`ROUTES.home` 保留為 `'/'`
7. **文件**:填 `templates/AGENTS.md`、`templates/README.md`(所有 `<!-- FILL: -->` 填完刪掉註解,`{{PLACEHOLDER}}` 全部替換;
   不知道的寫「待確認」,不編造)

既有專案:新畫面需要的權限代碼加進 `permissions.ts`;新的 SPEC 與 prototype 版本放進 `docs/spec/`、`docs/prototype/`。

## 步驟 4:依 SPEC 產生程式碼

每個畫面一個切片,依 `docs/conventions/project-structure.md` 第 4 節的順序:

1. `types/api/<資源>.ts`:DTO 與 request 型別,與契約逐字一致;沒有契約就依 SPEC 欄位提草案,檔案註解標「草案」
2. `api/<資源>Api.ts`:每個端點一個函式,`apiPath()` 組路徑,清單用 `expectArray()`
3. `mocks/handlers.ts` 的 `pendingHandlers` + `mocks/db.ts` 的 `seedXxx()`:後端已上線的端點放 `shippedHandlers`
4. `hooks/use<資源>.ts`(`queryOptions` + `useSuspenseQuery`)、`hooks/use<資源>Mutations.ts`(`useActionMutation` + invalidate)
5. `components/<domain>/`:元件從 hook 拿資料;表格用 `DataGrid`、表單欄位用 `FormField`;寫入按鈕包 `<Can>`;刪除走 `useConfirmDestructive`;
   純圖示按鈕用 `IconButton`
6. `pages/<Name>/<Name>Page.tsx`:只組裝、放 `DataBoundary`、讀寫 URL state
7. `constants/routes.ts` → `navEntries.tsx`(設 `permission`)→ `navPages.tsx`;不在選單的頁面 → `subPages.tsx` + `routes.tsx`
8. `i18n/zhTW.ts`、`en.ts`:所有文案、aria-label;新錯誤 code 進 `types/api/error.ts` 與 `errors.byCode`
9. `pages/<Name>/<Name>Page.test.tsx`:SPEC 的每個行為與缺漏狀態一個 `it`,`renderApp('/路徑')` 進入,斷言引用字典
10. `npm run lint && npm run typecheck && npm test`

寫法以 `docs/conventions/` 為準;骨架的 Item 範例(`itemApi.ts`、`useItems.ts`、`ItemTable.tsx`、`ItemsPage.tsx`、
`ItemsPage.test.tsx`)是每一層的樣板,照著寫。

規則提醒:

- 登入、登出、401、權限守衛、錯誤卡、toast、字典、主題、表格(`DataGrid`)、表單(`FormField`)一律用骨架既有機制;**不要**為某個畫面另寫一套
- 顏色只用 `theme/tokens.ts` 的 token;圖示只用 `@ant-design/icons`;文案全部進字典
- 不新增套件;真的需要時停下來問,並在 `docs/conventions/tech-stack.md` 的流程下記錄
- 外殼(header、側欄)與 prototype 不同時最後處理;登入頁只調 token 與文案,不改結構
- 與 prototype 或 SPEC 不一致、做不到的地方列入回報的「偏離」與「待確認」,不默默改掉

**全部畫面完成後,移除 Item 範例功能:**

1. 刪除 `src/types/api/item.ts`、`src/api/itemApi.ts`、`src/hooks/useItems.ts`、`src/hooks/useItemMutations.ts`、
   `src/components/items/`、`src/pages/Items/`
2. `navEntries.tsx` 移除 `items` 入口與 `NavKey` 的 `'items'`;`navPages.tsx` 移除 `items`;`routes.ts` 移除 `items`
3. `permissions.ts` 移除 `itemsRead`、`itemsWrite`(真實功能沒有沿用時);`db.ts` 的 `seedUser()` 同步
4. 字典移除 `items` 區塊與 `nav.items`;`handlers.ts`、`db.ts` 移除 items 的 handler 與種子資料
5. `RequirePermission.test.tsx`、`RequireAuth.test.tsx` 改用真實功能的路由、權限與資料
6. `grep -ri "item" src` 只剩真實功能的內容;四項檢查全綠

## 步驟 5:驗證、commit 與回報

```bash
cd <project>
npm run lint && npm run typecheck && npm test && npm run build
node <skill>/scripts/check-placeholders.mjs .
```

- 四個指令全綠(lint 不得有 warning);`check-placeholders` 0 個 ERROR
- `npm run dev:mock` 以 `MOCK_LOGIN`(admin / admin)登入,淺色、深色各看過一次每個畫面
- 全部通過後 commit(訊息需符合 commitlint):新專案
  `git add -A && git commit -m "feat: 依 <SPEC 版本> 建立專案(frontend-project-bootstrap v<版本>)"`;
  既有專案依畫面分 commit,`feat(<domain>): <畫面>`
- 回報給使用者:
  1. 暫定決定(使用者沒回答而採用建議的項目),放最上面
  2. 完成的畫面清單:路由、權限、測試數
  3. 偏離 prototype 或 SPEC 的地方與原因
  4. 仍待確認的問題(含 DTO 草案、找不到對應圖示、缺的畫面)
  5. 下一步:`npm run dev:mock` 驗收;後端上線後把對應 handler 搬到 `shippedHandlers`

## 無人值守時

使用者不在(排程執行或已說明晚點回來):

- 有建議答案的問題:採用建議,在回報標記「採用建議(暫定)」
- 沒有建議答案的問題(登入服務端點、聯絡窗口、環境網址):寫「待確認」,照常繼續
- 兩者都列在最後回報裡(前者放第 1 項,後者放第 4 項)
- 唯一會停下來的情況:步驟 1 發現 `<project>` 有內容卻不是公版產生的
