# AGENTS.md — Agent 開工前必讀

> 本文件只列「動工時必須遵守」的規則。細則見 [`docs/conventions/`](./docs/conventions/),決策紀錄見 [`docs/adr/`](./docs/adr/)。

## 專案

{{PROJECT_NAME}}:{{PROJECT_ONE_LINER}}

## 開工前要讀

1. 這份 `AGENTS.md`
2. 規格 [`docs/spec/`](./docs/spec/)(PM 提供,需求的唯一來源)與 prototype [`docs/prototype/`](./docs/prototype/)(UI/UX 提供,視覺驗收標準;HTML 或 React 原始碼都只是設計稿,不是可複製的程式碼)
3. 任務碰到的那一層的 `docs/conventions/`(只讀規則與 ✅ / ❌ 範例;「原因」段落略過);`docs/adr/` **不讀**——它解釋為什麼,
   lint 與規範已經擋住該擋的。**先抄範例再翻規範**:`src/` 裡既有的同層檔案是最短的規範
4. 與既有 ADR 衝突時,**在回報裡明講**,不要默默蓋過

## 怎麼做事(多 agent)

- 一個畫面一個子任務,角色提示詞在 [`docs/agents/`](./docs/agents/):`screen-builder`(做畫面)、`lint-fixer`(修紅字)、
  `challenger`(動工前挑戰工作清單)、`reviewer`(完工後審查)。主對話只填共用檔、派工、跑檢查,不自己寫畫面。
- 模型三層:決策(收件、清單、審查)/ 實作(畫面)/ 雜務(疊模組、測試、修紅字);挑戰者用不同家的模型。思考深度:有權衡才高,照抄就低。
- 改一個檔只 `npx eslint <檔>`;一個畫面做完才 `tsc -b` 與該頁測試;整包四項檢查主對話收回一批跑一次;build 最後一次。

## 技術棧

React 19 + React Compiler、Vite 8、TypeScript(strict)、Ant Design 6、React Router 8、TanStack Query 5、Zustand 5、Axios;
測試 Vitest + Testing Library。
<!-- FILL: 依 docs/adr/0022 填選用模組,一句話接在上一段後面,例如「選用模組:AG Grid Enterprise(表格)、React Hook Form(表單)、
     MSW(假後端)、typed 字典(多語系)、深色模式」;沒選的不寫。五個都沒選就寫「未選用任何可選模組」。 -->

新增套件前先讀 [`docs/conventions/tech-stack.md`](./docs/conventions/tech-stack.md)。

## 鐵律

1. **API 資料一律用 TanStack Query,絕不寫進 Zustand。** Zustand 只放全域 UI 狀態與閘門狀態;篩選、分頁、tab 放 URL。
2. **讀取用 `useSuspenseQuery` + 窗格外包 `DataBoundary`;寫入用 `useActionMutation`。** 例外要在 hook 註解寫理由。
3. **依「層」放檔案。** endpoint → `api/`、DTO → `types/api/`、資料 hook → `hooks/`、UI → `components/<domain>/`、
   store → `stores/`;`pages/` 只組裝與放邊界。跨資料夾用 `@/`,同資料夾用 `./`,不准 `../`。
4. **useEffect 預設不用。** 只有同步外部系統(DOM、計時器、訂閱)才用,且一定回傳 cleanup。
5. <!-- FILL: 依 docs/adr/0022 擇一保留:
     選了 i18n →「**畫面上每個字都進 i18n 字典**(含 `aria-label`)。測試斷言也引用字典,不寫死文字。」
     沒選 i18n →「**文案直接寫繁中字串**(含 `aria-label`);錯誤文案只在 `utils/describeError.ts`,系統名稱只在 `constants/app.ts`。」 -->
6. **視覺以 prototype 為準。** 顏色只用 `theme/tokens.ts` 的 token;圖示只用 `@ant-design/icons`,不用 emoji 或文字頂替。
   prototype 是 React 原始碼時,可搬:JSX 結構、表單欄位與驗證、`columnDefs`、互動流程;不搬:它的 router、state、
   API 呼叫、樣式方案、登入 / 閘門 / 權限 / theme / i18n 實作(ADR-0001 第 6 點)。搬入的片段仍要過規範,不加來源註解。
7. **登入交給公司 SDK,閘門只在 `app/accessGate.ts`。** 不做登入頁、不保管 token、不判 401;「不在公司網路」「沒有系統權限」
   的狀態碼只寫在 `ACCESS_GATE_RULES`,整頁遮罩由 `AccessMask` 負責;公司套件只從 `vendor/companyUi.tsx` import。
   <!-- FILL: 選了 permissions 模組時接一句「細粒度權限:`navEntries.tsx` 設 `permission`、按鈕包 `<RequirePermission>`」;沒選刪除這個註解。 -->
8. **不准新增未經同意的套件、不准寫死色碼、不准在元件裡 import axios 或 `@/api` 的 endpoint module。**
   (後兩條由 lint 擋下。)
9. **新增或修改端點 / DTO 後重跑 `npm run api-contract`,`docs/api-contract.md` 與程式碼一起進 PR。** 端點函式要有 JSDoc
   (功能、`@screen`、`@error`;[`docs/conventions/api.md`](./docs/conventions/api.md) 第 7 節);契約表不手改,CI 會比對。

## 元件寫法

- 所有函式 `const x = () => {}`;元件 `const X: React.FC<XProps> = (props) => {}`,只用 `export default X`
- props interface 命名 `<元件名>Props`,放在元件正上方;沒有 props 寫 `React.FC`,不造空 interface
- 元件內順序:非 react 的 hook → useId → useRef → useState → useMemo → useEffect → 衍生值 → JSX
  (依賴優先;規則見 [`docs/conventions/components.md`](./docs/conventions/components.md))
- React Compiler 負責 memoization:**不要手寫 `useCallback` / `useMemo` / `React.memo`**,除非 Compiler 處理不了且註解寫明
- 共用零件在 `components/common/`,不手刻:`DataBoundary`、`LoadErrorPanel`、`IconButton`;確認框用 `useConfirmDestructive`
- <!-- FILL: 依 docs/adr/0022 寫表格與表單各一句:
     ag-grid →「**資料表格一律 `DataGrid`(AG Grid),不用 antd `Table`**([`ag-grid.md`](./docs/conventions/ag-grid.md))」;
     沒選 →「**資料表格用 antd `Table`**,欄位定義 `TableColumnsType<DTO>`([`components.md`](./docs/conventions/components.md))」。
     react-hook-form →「**表單狀態一律 React Hook Form,一個欄位一個 `FormField`,不用 `Form.useForm` / `Form.Item name`**
     ([`react-hook-form.md`](./docs/conventions/react-hook-form.md))」;沒選 →「**表單用 antd `Form.useForm` + `Form.Item name`**」。 -->

## 資料夾速查

```
src/
  api/          apiClient(cookie)、apiError、各資源的 endpoint module;選了 permissions 還有 permissionApi
  app/          Providers、路由表、QueryClient、accessGate(閘門規則與 interceptor)、選單入口 → 頁面對照(navPages、subPages)
  components/   common/(共用零件、AccessMask)、layouts/(外殼、選單 navEntries)、<domain>/;選了 permissions 還有 auth/(RequirePermission)
  constants/    routes、storage key、app(系統名稱;選了 i18n 時沒有這個檔);選了 permissions 還有 permissions
  hooks/        資料 hook(queryOptions + useSuspenseQuery)、mutation hook、跨元件 UI hook
  pages/        路由頁面(只組裝)
  stores/       Zustand(UI 狀態 useLayoutStore、閘門狀態 useAccessStore)
  test/         測試 setup、renderApp、companyUiStub(公司套件替身)
  theme/        tokens(唯一色票來源)、antdTheme、cssVars
  vendor/       companyUi(公司套件的唯一轉接點:遮罩、外殼、使用者資訊)
  types/api/    與後端逐字一致的 DTO
  utils/        純函式
```

<!-- FILL: 依 docs/adr/0022 在上面的速查補上選用模組的位置,補完刪除這段:
     i18n → `i18n/  zhTW.ts(字典形狀來源)、en.ts、useTranslations`,`stores/` 加 useLanguageStore,`constants/` 刪掉 app;
     msw → `mocks/  MSW handler(pendingHandlers 給開發期與測試;shippedHandlers 只給測試)`;
     ag-grid → `app/` 加 agGrid(模組與授權)、`theme/` 加 agGridTheme;dark-mode → `stores/` 加 useThemeStore;
     permissions → `components/auth/`、`pages/Forbidden/`、`hooks/usePermission`。 -->

## 測試 seam

測試只在這兩個邊界寫:

- **頁面與元件行為**:`renderApp('/路徑')` 從網址進入,經過真的 Provider、路由、`AccessMask` 與 `DataBoundary`;
  <!-- FILL: 依 docs/adr/0022 擇一:選了 msw →「打 MSW 假後端(`server.use(...)` 覆寫個別回應)」;
       沒選 msw →「API 模組以 `vi.mock('@/api/<資源>Api')` 換掉,在 `beforeEach` 給預設回應,假資料在 `src/test/fixtures.ts`」。 -->
  斷言畫面文字<!-- FILL: 選了 i18n 寫「(引用字典)」,沒選就刪掉這個註解 -->。不 mock hook、不單獨 render 元件。
  登入沒有東西可測;要測遮罩讓 API 回閘門的狀態碼(`AccessMask.test.tsx`)
- **純函式**(`utils/`、`api/apiError.ts`):直接單元測試

規格的每個行為一個 `it`;有 scenario 編號就帶在名稱裡。視覺一致性不靠測試,靠 PR 截圖對照 prototype。

## 本專案特有規則

- 路由模式:<!-- FILL: history 或 hash,連到 docs/adr/0020-router-mode.md -->
- 閘門與公司套件:<!-- FILL: 一句話,例如「外網 423、無權限 403 + code;遮罩用 @company/ui 的 AccessBlocked」,連到 docs/adr/0021-access-gate.md -->
- 選用模組:<!-- FILL: 採用的模組與細項(例如「i18n、msw、ag-grid(Enterprise)」),連到 docs/adr/0022-selected-modules.md -->

<!-- FILL: 其他偏離或補充團隊標準的規則,每條連到對應 ADR(docs/adr/0023 起)。沒有就刪除這行。 -->

## 常用指令

| 指令                                | 用途                                                 |
| ----------------------------------- | ---------------------------------------------------- |
| `npm install`                       | 安裝依賴(本機一律 `npm install`;只有 CI 用 `npm ci`) |
| `npm run dev`                       | 開發伺服器                                           |
| `npm run lint` / `npm run lint:fix` | oxlint + ESLint                                      |
| `npm run typecheck`                 | 型別檢查                                             |
| `npm test`                          | Vitest                                               |
| `npm run build`                     | 正式建置                                             |

<!-- FILL: 選了 msw 時在表格 `npm run dev` 下面加一列「`npm run dev:mock` | 以 MSW 假後端開發(假後端帳密見 `src/mocks/db.ts`)」;
     沒選就刪除這段。 -->

## 完成任務前的自我檢查

- [ ] `npm run lint`、`npm run typecheck`、`npm test`、`npm run build` 全部通過
- [ ] 規格裡這個畫面的每個行為都有對應測試,全部通過
- [ ] <!-- FILL: 選了 i18n →「新增文案都進了 `zhTW.ts` 與 `en.ts`;新的錯誤 code 也進了 `errors.byCode`」;沒選 →「新的錯誤 code 進了 `types/api/error.ts` 與 `utils/describeError.ts`」 -->
- [ ] 新端點:DTO 在 `types/api/`、與契約逐字一致<!-- FILL: 選了 msw 加「、mock handler 進 `pendingHandlers`」,沒選就刪掉這個註解 -->
- [ ] 沒有自己判 401 或閘門狀態碼;公司套件只從 `vendor/companyUi.tsx` import
- [ ] 與 prototype 或規格不同之處,已在回報與 PR 的「偏離設計稿」寫明
- [ ] 回報:改了哪些檔、每個改動一句話、驗證指令與結果、計畫外的發現

## 文件規則

文件(`AGENTS.md`、`README.md`、`docs/`)只寫現行規則,不留歷史與日期;每檔 200 行以內。
團隊規範(`docs/conventions/`、`docs/adr/` 的基線 0001–0019)來自團隊公版,**不在專案內修改**;要偏離就寫新的 ADR。
規格(`docs/spec/`)與 prototype(`docs/prototype/`)由 PM 與 UI/UX 維護,改版時換檔並帶版本。
