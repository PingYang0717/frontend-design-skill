# 套用流程細節

`SKILL.md` 列出步驟與停頓點;這份補上每一步的具體做法。`<skill>` 指這個 Skill 的根目錄,`<project>` 指新專案根目錄。

## 步驟 1:收件

**先檢查 `<project>`**:不存在就建立;已存在且有任何內容就**停下來**問使用者(無人值守時停止並回報),
這個 Skill 不處理既有專案。

問使用者(已在訊息中提供的就不再問):

| 問題                                                                           | 用途                                                                                                                                                  |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 專案名稱:中文顯示名、英文顯示名、slug(英文小寫 kebab-case)                     | `package.json` name、`<title>`、字典 `app.name`(zhTW / en)、文件標題。沒有英文名稱時,英文顯示名用 slug 轉 Title Case(`room-booking` → `Room Booking`) |
| 一句話說明:給誰用、做什麼                                                      | README、AGENTS、GLOSSARY                                                                                                                              |
| prototype 檔案、版本(或交付日期)、**團隊共享的存放位置**(雲端硬碟、文件庫連結) | `docs/prototype/README.md` 記共享位置,不記本機路徑                                                                                                    |
| 部署環境:能否設定伺服器 fallback、是否部署在子路徑                             | 路由模式 ADR                                                                                                                                          |
| 後端現況:已有 / 開發中 / 未開始;有無 API 文件;認證方式                         | `docs/api/`、mock 範圍                                                                                                                                |
| 是否需要多語系(預設只做繁中,英文字典仍保留)                                    | i18n                                                                                                                                                  |
| 是否需要深色模式                                                               | theme                                                                                                                                                 |

prototype 原檔**進版控**:HTML 複製到 `<project>/docs/prototype/<檔名>`(檔名帶版本,例如 `prototype-v1.2.html`);
設計檔連結或截圖則放 `docs/prototype/screens/` 並在 `docs/prototype/README.md` 記來源。之後在乾淨 context 裡開工的
agent 只看得到 repo 裡的東西,所以驗收標準必須在 repo 裡。

## 步驟 2:分析 prototype 與截圖

依 `references/prototype-analysis.md` 進行,把 `templates/prototype-analysis.md` 複製到
`<project>/docs/_bootstrap/prototype-analysis.md` 再填。這與 `docs/prototype/` 是步驟 3 之前專案資料夾裡唯一的內容,不算「既有內容」。

分析檔第 2 節的畫面清單定稿後,為每個畫面截圖:

```bash
cp <skill>/templates/prototype-screens.json <project>/docs/prototype/screens.json
# 填 file(prototype 檔名)、每個畫面的 id(與分析檔第 2 節一致,kebab-case)與進入步驟、深色切換步驟(沒有就 null)
node <skill>/scripts/screenshot-prototype.mjs <project>
```

- 進入步驟怎麼找:單檔 React / Vue 成品通常用 hash 或某個 state 切換畫面——先試 `hash`;不行就找選單項目的文字或
  `aria-label` 用 `click`;對話框、抽屜要先進到所屬畫面再 `click` 開啟它
- 失敗的畫面腳本會列出來:修 `screens.json` 再用 `--only <id>` 重跑那幾張;**真的截不到的列入待確認**,不要略過
- 使用者用 Figma 或只給截圖時沒有 `screens.json`:把拿到的圖存成 `docs/prototype/screens/<id>.png`,命名規則相同

**完成後停下來**,依 `references/prototype-analysis.md` 的「停頓點」分輪提問。收到回答後填進分析檔第 11、12 節。

## 步驟 3:建立骨架

```bash
# 複製骨架(不含 node_modules、dist);沒有 rsync 時用 cp -R 後刪掉 node_modules
rsync -a --exclude node_modules --exclude dist <skill>/assets/skeleton/ <project>/
cd <project>
git init                                   # 若還不是 git repo
npm pkg set name=<slug>
npm install --package-lock-only --ignore-scripts   # 讓 lockfile 的 name 跟著改;不跑 prepare(husky 尚未安裝)
npm ci
```

接著依序修改:

1. **名稱**:`index.html` 的 `<title>` → 中文顯示名;`src/i18n/zhTW.ts`、`en.ts` 的 `app.name` → 中文 / 英文顯示名
2. **色票**:`src/theme/tokens.ts` 的 `LIGHT_TOKENS` / `DARK_TOKENS` 依分析檔第 5 節逐值替換。
   prototype 沒提供深色時保留骨架預設;只提供部分深色值時,有給的照抄,沒給的維持 `...LIGHT_TOKENS` 繼承
   (seed token 本來就兩主題同值,由 antd 推導深色);兩種情況都在分析檔記錄
3. **路由模式**:history 維持 `createBrowserRouter`;hash 改 `createHashRouter` 並新增 `src/utils/appHref.ts`
   (寫法見 `docs/conventions/routing.md`)
4. **首頁**:骨架的 `/` 是 `home` 入口(`pages/Home/HomePage.tsx`,附最小測試範本 `HomePage.test.tsx`)。
   - prototype 有首頁:把 `HomePage` 改成空白頁(見第 6 點),保留 `home` 入口
   - prototype 沒有首頁:**先完成第 5–7 點**(新頁面與測試都照 `HomePage.test.tsx` 寫好),再做以下清理:
     1. 刪除 `pages/Home/`
     2. `navEntries.tsx`:刪掉 `home` 入口,`NavKey` 移除 `'home'`;`navPages.tsx` 移除 `home`
     3. 字典 `zhTW.ts`、`en.ts`:刪掉 `nav.home` 與 `pages.home`
     4. `app/routes.tsx` 的 children 最前面加 `{ index: true, element: <Navigate to={ROUTES.<第一個畫面>} replace /> }`
     5. `components/auth/RequirePermission.test.tsx`:第二個測試原本斷言首頁的歡迎文字,改成斷言第一個畫面
     6. `ROUTES.home` 保留為 `'/'`:`ForbiddenPage`、`NotFoundPage` 的「回首頁」會經由上面的導向到達第一個畫面
5. **路由與選單**:每個畫面在 `src/constants/routes.ts` 加路徑;選單上的畫面加進 `navEntries.tsx` 與
   `app/navPages.tsx`;不在選單上的畫面(詳細頁、編輯頁)放 `app/subPages.tsx` 與 `app/routes.tsx`
   (見 `docs/conventions/routing.md` 第 3 節)
6. **空白頁面**:每個畫面建立 `src/pages/<Name>/<Name>Page.tsx`,內容只有 antd `Card`(`title` 用字典)與
   一行說明文字(也進字典,例如「此頁面依 T-00x 實作」),**不實作業務功能**
7. **頁面測試**:每個新頁面複製 `pages/Home/HomePage.test.tsx` 的寫法加一支最小測試,斷言頁面**獨有**的文字
   (標題常與選單同名,會找到多個元素)
8. **權限**:`src/constants/permissions.ts` 依權限矩陣新增代碼;`src/mocks/db.ts` 的 `currentUser.permissions`
   給齊所有權限,開發期才看得到全部畫面
9. **外殼**:header、側欄與 prototype 不同時(圖示、語言切換、使用者選單),**不在這一步改**;開一張任務單處理
10. **範例功能**:保留 Item 範例,把 `templates/task-remove-example.md` 放進 `docs/tasks/`(狀態已是 `ready-for-agent`,
    前置任務是第一張真實功能)

每改完一批就跑 `npm run lint && npm run typecheck && npm test`,不要累積到最後。

## 步驟 4:產出文件

| 來源                                                                                  | 目的地                                         | 處理                                                                                                                              |
| ------------------------------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `references/standards/*`                                                              | `docs/conventions/`                            | 原樣複製                                                                                                                          |
| `references/adr-baseline/*`                                                           | `docs/adr/`                                    | 原樣複製                                                                                                                          |
| `templates/adr-router-mode.md`                                                        | `docs/adr/0017-router-mode.md`                 | 填寫;其他偏離從 0018 起用 `templates/adr.md`                                                                                      |
| `templates/README.md`、`AGENTS.md`、`ARCHITECTURE.md`、`GLOSSARY.md`、`CLAUDE.md`     | 專案根目錄                                     | 填寫                                                                                                                              |
| `templates/prototype-README.md`                                                       | `docs/prototype/README.md`                     | 填寫                                                                                                                              |
| `templates/api-interface-auth.md`                                                     | `docs/api/interface-auth.md`                   | 填寫(`GET /me` 是骨架既有端點)                                                                                                    |
| `templates/api-interface.md`                                                          | `docs/api/interface-<domain>.md`(每個領域一份) | 依分析檔第 7 節填寫;未經後端確認的標「草案」                                                                                      |
| `templates/api-checklist.md`                                                          | `docs/api/api-checklist.md`                    | 每條端點一列,含 `GET /me`                                                                                                         |
| `templates/feature-spec.md`                                                           | `docs/specs/<feature>.md`(每個功能一份)        | 依分析檔填寫 BDD,含缺漏狀態的 scenario                                                                                            |
| `templates/task.md`                                                                   | `docs/tasks/<ID>-<slug>.md`                    | 每個垂直切片一張,對應 scenario 編號;外殼調整也開一張;狀態一律 `ready-for-agent`,「參考畫面」連到 `docs/prototype/screens/` 的 png |
| `templates/tasks-README.md`                                                           | `docs/tasks/README.md`                         | 填寫:所有任務一列,與各任務單的狀態一致                                                                                            |
| `templates/task-remove-example.md`                                                    | `docs/tasks/T-999-remove-example.md`           | 原樣複製                                                                                                                          |
| `templates/agents/issue-tracker.md`、`domain.md`                                      | `docs/agents/`                                 | 原樣複製(mattpocock skills 的設定;`AGENTS.md` 的 `## Agent skills` 指向這裡)                                                      |
| `templates/feature-spec.md`、`task.md`、`adr.md`、`bug-report.md`、`api-interface.md` | `docs/templates/`                              | 原樣複製,給之後新增用                                                                                                             |

填寫原則:

- 每個 `<!-- FILL: ... -->` 依它寫的來源填寫,**填完刪掉註解本身**;`{{PLACEHOLDER}}` 全部替換
- 不知道的資訊寫「待確認」並列入分析檔第 11 節,不要編造
- **Item 範例功能不寫進任何文件**(README 路由表、ARCHITECTURE 的 domain 與權限、GLOSSARY 名詞);
  它只存在到 T-999 完成,文件描述的是專案本身
- 名詞一律用 `GLOSSARY.md` 的詞;路由、權限代碼、元件名稱在各文件之間必須一致
- 任務單切法:一張 = 一個可展示的功能切片;第一張選最能代表專案的畫面,讓它成為後續任務的參考。
  「前置任務」就是 blocked-by:第一張與外殼調整那張沒有前置;其餘依賴第一張;T-999 依賴第一張。
  任務單裡**要寫檔案路徑**(這是 `/implement` 在這個骨架裡不迷路的原因),但不貼程式碼
- 規格的 scenario 編號前綴用功能縮寫(例如 `ORD`),跨文件引用都用這個編號
- 「文件不留日期」的例外:`docs/prototype/README.md` 的版本紀錄、規格的偏離紀錄(記 prototype 版本)
- 「每檔 200 行」不適用 `docs/_bootstrap/`:分析檔是一次性的工作紀錄,寫完整比壓行數重要

## 步驟 5:驗證、commit 與回報

```bash
cd <project>
npm run lint && npm run typecheck && npm test && npm run build
node <skill>/scripts/check-placeholders.mjs .
```

- 四個指令全綠(lint 不得有 warning);`check-placeholders` 0 個 ERROR(範例功能的 WARN 是預期的)
- 抽查連結:`docs/conventions/` 與 `docs/adr/` 互相連結、README 文件地圖的連結都存在、每張任務單的「參考畫面」
  指到存在的 png
- 全部通過後做第一次 commit(訊息需符合 commitlint):
  `git add -A && git commit -m "chore: bootstrap project from frontend-project-bootstrap v<版本>"`
- 回報給使用者:
  1. 暫定決定(使用者沒回答而採用建議的項目),放最上面
  2. 產出的檔案清單(依資料夾分組)
  3. 偏離團隊標準之處與對應 ADR
  4. 仍待確認的問題(含沒有建議答案、只能寫「待確認」的項目)
  5. 建議的第一張任務單,以及開工指令:`git checkout -b <任務單的分支>` 後 `/implement docs/tasks/<ID>-<slug>.md`

## 無人值守時

使用者不在(排程執行或已說明晚點回來):

- 有建議答案的問題:採用建議,在分析檔標記「採用建議(暫定)」
- 沒有建議答案的問題(認證方式、聯絡窗口、環境網址):寫「待確認」,照常繼續
- 兩者都列在最後回報裡(前者放第 1 項,後者放第 4 項)
- 唯一會停下來的情況:步驟 1 發現 `<project>` 已有內容
