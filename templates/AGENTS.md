# AGENTS.md — Agent 開工前必讀

> 本文件只列「動工時必須遵守」的規則。細則見 [`docs/conventions/`](./docs/conventions/),決策紀錄見 [`docs/adr/`](./docs/adr/)。

## 專案

{{PROJECT_NAME}}:{{PROJECT_ONE_LINER}}

## 開工前要讀

1. 這份 `AGENTS.md`
2. 規格 [`docs/spec/`](./docs/spec/)(PM 提供,需求的唯一來源)與 prototype [`docs/prototype/`](./docs/prototype/)(UI/UX 提供,視覺驗收標準)
3. 任務碰到的領域對應的 `docs/conventions/` 與 `docs/adr/`
4. 與既有 ADR 衝突時,**在回報裡明講**,不要默默蓋過

## 技術棧

React 19 + React Compiler、Vite 8、TypeScript(strict)、Ant Design 6、React Router 8、
TanStack Query 5、Zustand 5、Axios;測試 Vitest + Testing Library + MSW。
新增套件前先讀 [`docs/conventions/tech-stack.md`](./docs/conventions/tech-stack.md)。

## 鐵律

1. **API 資料一律用 TanStack Query,絕不寫進 Zustand。** Zustand 只放全域 UI 狀態與登入 token;篩選、分頁、tab 放 URL。
2. **讀取用 `useSuspenseQuery` + 窗格外包 `DataBoundary`;寫入用 `useActionMutation`。** 例外要在 hook 註解寫理由。
3. **依「層」放檔案。** endpoint → `api/`、DTO → `types/api/`、資料 hook → `hooks/`、UI → `components/<domain>/`、
   store → `stores/`;`pages/` 只組裝與放邊界。跨資料夾用 `@/`,同資料夾用 `./`,不准 `../`。
4. **useEffect 預設不用。** 只有同步外部系統(DOM、計時器、訂閱)才用,且一定回傳 cleanup。
5. **畫面上每個字都進 i18n 字典**(含 `aria-label`)。測試斷言也引用字典,不寫死文字。
6. **視覺以 prototype 為準。** 顏色只用 `theme/tokens.ts` 的 token;圖示只用 `@ant-design/icons`,不用 emoji 或文字頂替。
7. **登入、權限、401 用公版,不另寫。** 登入狀態只在 `useSessionStore`、401 只在 `app/session.ts`;需要登入的頁面都在
   `RequireAuth` 底下;權限在 `navEntries.tsx` 設 `permission`、按鈕包 `<Can>`。
8. **不准新增未經同意的套件、不准寫死色碼、不准在元件裡 import axios 或 `@/api` 的 endpoint module。**
   (後兩條由 lint 擋下。)

## 元件寫法

- 所有函式 `const x = () => {}`;元件 `const X: React.FC<XProps> = (props) => {}`,只用 `export default X`
- props interface 命名 `<元件名>Props`,放在元件正上方;沒有 props 寫 `React.FC`,不造空 interface
- 元件內順序:非 react 的 hook → useId → useRef → useState → useMemo → useEffect → 衍生值 → JSX
  (依賴優先;規則見 [`docs/conventions/components.md`](./docs/conventions/components.md))
- React Compiler 負責 memoization:**不要手寫 `useCallback` / `useMemo` / `React.memo`**,除非 Compiler 處理不了且註解寫明
- 共用零件在 `components/common/`,不手刻:`DataBoundary`、`LoadErrorPanel`、`IconButton`;確認框用 `useConfirmDestructive`

## 資料夾速查

```
src/
  api/          apiClient、apiError、authApi、各資源的 endpoint module
  app/          Providers、路由表、QueryClient、session(token 與 401)、選單入口 → 頁面對照(navPages、subPages)
  components/   common/(共用零件)、layouts/(外殼、選單 navEntries、UserMenu)、auth/(RequireAuth、RequirePermission、Can)、<domain>/
  constants/    routes、permissions、storage key
  hooks/        資料 hook(queryOptions + useSuspenseQuery)、mutation hook、跨元件 UI hook
  i18n/         zhTW.ts(字典形狀來源)、en.ts、useTranslations
  mocks/        MSW handler(pendingHandlers 給開發期與測試;shippedHandlers 只給測試)、MOCK_LOGIN
  pages/        路由頁面(只組裝);Login/ 是公版登入頁
  stores/       Zustand(UI 狀態與 useSessionStore)
  test/         測試 setup(預設已登入)與 renderApp
  theme/        tokens(唯一色票來源)、antdTheme、cssVars
  types/api/    與後端逐字一致的 DTO
  utils/        純函式
```

## 測試 seam

測試只在這兩個邊界寫:

- **頁面與元件行為**:`renderApp('/路徑')` 從網址進入,經過真的 Provider、路由、`RequireAuth` 與 `DataBoundary`,打 MSW 假後端;
  斷言畫面文字(引用字典)。不 mock hook、不單獨 render 元件。測試預設已登入;要測未登入用 `useSessionStore.setState({ accessToken: null })`
- **純函式**(`utils/`、`api/apiError.ts`):直接單元測試

規格的每個行為一個 `it`;有 scenario 編號就帶在名稱裡。視覺一致性不靠測試,靠 PR 截圖對照 prototype。

## 本專案特有規則

- 路由模式:<!-- FILL: history 或 hash,連到 docs/adr/0018-router-mode.md -->
- 認證方式:<!-- FILL: 帳密 + Bearer token / SSO / gateway cookie,連到 docs/adr/0019-auth-mode.md -->

<!-- FILL: 其他偏離或補充團隊標準的規則,每條連到對應 ADR(docs/adr/0020 起)。沒有就刪除這行。 -->

## 常用指令

| 指令                                | 用途                                                           |
| ----------------------------------- | -------------------------------------------------------------- |
| `npm install`                       | 安裝依賴(本機一律 `npm install`;只有 CI 用 `npm ci`)           |
| `npm run dev` / `npm run dev:mock`  | 開發伺服器 / 以 MSW 假後端開發(假後端帳密見 `src/mocks/db.ts`) |
| `npm run lint` / `npm run lint:fix` | oxlint + ESLint                                                |
| `npm run typecheck`                 | 型別檢查                                                       |
| `npm test`                          | Vitest                                                         |
| `npm run build`                     | 正式建置                                                       |

## 完成任務前的自我檢查

- [ ] `npm run lint`、`npm run typecheck`、`npm test`、`npm run build` 全部通過
- [ ] 規格裡這個畫面的每個行為都有對應測試,全部通過
- [ ] 新增文案都進了 `zhTW.ts` 與 `en.ts`;新的錯誤 code 也進了 `errors.byCode`
- [ ] 新端點:DTO 在 `types/api/`、與契約逐字一致、mock handler 進 `pendingHandlers`
- [ ] 需要權限的入口與按鈕已設 `permission` / `<Can>`;需要登入的頁面在 `RequireAuth` 底下
- [ ] 與 prototype 或規格不同之處,已在回報與 PR 的「偏離設計稿」寫明
- [ ] 回報:改了哪些檔、每個改動一句話、驗證指令與結果、計畫外的發現

## 文件規則

文件(`AGENTS.md`、`README.md`、`docs/`)只寫現行規則,不留歷史與日期;每檔 200 行以內。
團隊規範(`docs/conventions/`、`docs/adr/0001–0017`)來自團隊公版,**不在專案內修改**;要偏離就寫新的 ADR。
規格(`docs/spec/`)與 prototype(`docs/prototype/`)由 PM 與 UI/UX 維護,改版時換檔並帶版本。
