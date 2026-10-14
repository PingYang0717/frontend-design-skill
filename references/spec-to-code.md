# 把 SPEC 與 prototype 轉成程式碼清單

步驟 2 的方法。目標是在動手前列出「要產生哪些檔案、每個檔案的內容從 SPEC 哪一節來」,
並找出擋住寫程式的缺口。清單放在任務清單裡,不另外寫文件。

## 1. SPEC 最少要有什麼

PM 的 SPEC 格式不限,但下面幾項是寫程式的前提。缺的列入停頓點;給 PM 的回饋也用這張表。

| 項目               | 用在                                       | 缺了怎麼辦                                                 |
| ------------------ | ------------------------------------------ | ---------------------------------------------------------- |
| 專案名稱(中 / 英)  | `package.json`、`<title>`、字典 `app.name` | 問                                                         |
| 畫面清單與進入方式 | 路由、選單、頁面檔                         | 從 prototype 列,請 PM 確認                                 |
| 每個畫面的欄位     | DTO、表格欄位、表單                        | 從 prototype 推,型別標「草案」                             |
| 每個動作的結果     | mutation、成功提示、失敗情境               | 問;失敗一律走骨架的 toast / 錯誤卡                         |
| 角色與權限矩陣     | `permissions.ts`、`permission`、`<Can>`    | 問;沒有答案先單一角色,全部不設 `permission`                |
| API 契約           | `types/api/`、`api/`、mock                 | 依欄位提草案,DTO 註解標「草案」,回報列待確認               |
| 認證方式           | `docs/adr/0021`、`authApi.ts`              | 問;沒有答案用骨架預設(帳密 + Bearer token)                 |
| 缺漏狀態(空、錯誤) | 測試案例                                   | 用骨架預設:空 → `Empty`,讀取失敗 → 錯誤卡,寫入失敗 → toast |

**事實自己查,決策才問。** 色碼、圖示、欄位名稱這些從 SPEC 或 prototype 讀得到的不問;問的是兩者都沒說、
要人拍板的事。一輪問完,每題編號、一句背景、2–3 個選項、建議答案。

## 2. 讀 prototype

| 型態                               | 怎麼讀                                                                                                                                                                                       |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 單一 HTML(打包的 React / Vue 成品) | 先找 `:root` / `[data-theme]` 的 CSS 變數與 `<style>`;再找畫面切換的狀態(view / page 的 state 與 switch)對照 SPEC 的畫面清單;找假資料陣列對照欄位;找圖示名稱(常見 `ant-design:xxx-outlined`) |
| 多頁 HTML                          | 每個檔案是一個候選畫面;共用的 header / 側欄是版面                                                                                                                                            |

大檔案不要整份讀:先搜尋 `:root`、`theme`、`color`、`fontFamily`、view 名稱、`aria-label`、表格欄位定義,再讀相關片段。
prototype 與 SPEC 不一致時以 SPEC 的行為、prototype 的視覺為準,並列入待確認。

## 3. 對映表

| SPEC / prototype 裡的東西     | 產生的程式碼                                                                                                                                     | 規範                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| 一個可獨立到達的畫面          | `constants/routes.ts` 一條;選單上的進 `navEntries.tsx` + `navPages.tsx`,不在選單的進 `subPages.tsx` + `routes.tsx`;`pages/<Name>/<Name>Page.tsx` | `routing.md`                            |
| 對話框、抽屜、分頁籤          | 所屬畫面的元件(`components/<domain>/`),不給路由                                                                                                  | `components.md`                         |
| 角色能做的事                  | `constants/permissions.ts` 一條(`<資源>:<動作>`);頁面設 `permission`,按鈕包 `<Can>`;`mocks/db.ts` 的使用者給齊                                   | `auth.md`                               |
| 表格、表單、詳細頁的欄位      | `types/api/<資源>.ts`(與契約逐字一致);request 型別另宣告                                                                                         | `api.md`、`typescript.md`               |
| 資料清單(排序、篩選、選取)    | `components/<domain>/<資源>Table.tsx`:`DataGrid` + `ColDef<DTO>[]`,儲存格元件、操作欄包 `<Can>`                                                  | `data-grid.md`                          |
| 表單(新增、編輯、登入)        | `useForm<Request 型別>` + 每個欄位一個 `FormField`,antd 只管版面與輸入元件                                                                       | `forms.md`                              |
| 讀取資料                      | `api/<資源>Api.ts` 的 `list` / `get` + `hooks/use<資源>.ts`(`queryOptions` + `useSuspenseQuery`)+ 窗格外 `DataBoundary`                          | `data-fetching.md`                      |
| 新增 / 修改 / 刪除 / 送出     | `api/<資源>Api.ts` 的 `create` / `update` / `delete` + `hooks/use<資源>Mutations.ts`(`useActionMutation` + invalidate)                           | `data-fetching.md`、`error-handling.md` |
| 篩選、搜尋、分頁、tab         | URL query string(`useSearchParams`),不放 state                                                                                                   | `state-management.md`                   |
| 色票、圓角、字型              | `theme/tokens.ts` 逐值替換(light、dark 各一組)                                                                                                   | `styling-theme.md`                      |
| 視覺樣式                      | antd 有對應元件 → 直接用;同樣式出現兩次以上 → `components/common/`;其餘 → `components/<domain>/`                                                 | `components.md`                         |
| 圖示                          | `@ant-design/icons`(`ant-design:menu-fold-outlined` → `MenuFoldOutlined`);找不到的列待確認,不用 emoji                                            | `styling-theme.md`                      |
| 畫面上每個字(含 aria-label)   | `i18n/zhTW.ts` + `en.ts`                                                                                                                         | `i18n.md`                               |
| 後端錯誤 code                 | `types/api/error.ts` 的 `KNOWN_ERROR_CODES` + 字典 `errors.byCode`                                                                               | `error-handling.md`                     |
| 後端未上線的端點              | `mocks/handlers.ts` 的 `pendingHandlers` + `mocks/db.ts` 種子資料                                                                                | `mocking.md`                            |
| SPEC 的每個行為、每個缺漏狀態 | 頁面測試一個 `it`(`renderApp('/路徑')`,斷言引用字典);SPEC 有 scenario 編號就帶在名稱裡                                                           | `testing.md`                            |

每個畫面至少測:正常顯示、主要寫入流程、讀取失敗 + 重試、沒有權限時入口或按鈕不存在、URL 狀態從網址進入。
登入、登出、401 已由骨架的測試涵蓋。

## 4. 工作清單的形狀

一個畫面一項,依 SPEC 的順序;第一項選最能代表專案的畫面。每項列出:

- 路由與是否在選單上、需要的權限代碼
- 要讀的資料(端點、DTO 欄位)與要寫的動作(端點、request 型別)
- 用到的 antd 元件、共用元件、自製元件
- 字典條目的分組(`pages.<name>`、`<domain>`)
- 測試案例清單

外殼(header、側欄)與 prototype 不同的地方另列一項,最後做;登入頁的差異只調整 token 與文案(見 `standards/login.md` 第 4 節)。
