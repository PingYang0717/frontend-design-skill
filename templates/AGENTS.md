# AGENTS.md — Agent 開工前必讀

> 本文件只列「動工時必須遵守」的規則。規則背後的理由見 [`ARCHITECTURE.md`](./ARCHITECTURE.md),
> 細則見 [`docs/conventions/`](./docs/conventions/),決策紀錄見 [`docs/adr/`](./docs/adr/)。

## 專案

{{PROJECT_NAME}}:{{PROJECT_ONE_LINER}}

<!-- FILL: 用 2–4 行說明使用者是誰、要完成什麼工作、有哪些主要畫面。來源:docs/_bootstrap/prototype-analysis.md 的「專案概要」。 -->

## 開工前要讀

1. 這份 `AGENTS.md`
2. [`CONTEXT.md`](./CONTEXT.md):領域名詞。寫程式、測試名稱、commit 一律用這裡的詞,不用「避免」欄的同義詞
3. 任務單指到的規格(`docs/specs/`)與任務單本身(`docs/tasks/`)
4. 任務碰到的領域對應的 `docs/conventions/` 與 `docs/adr/`
5. 與既有 ADR 衝突時,**在回報裡明講**,不要默默蓋過

## 技術棧

React 19 + React Compiler、Vite 8、TypeScript(strict)、Ant Design 6、React Router 8、
TanStack Query 5、Zustand 5、Axios;測試 Vitest + Testing Library + MSW。
新增套件前先讀 [`docs/conventions/tech-stack.md`](./docs/conventions/tech-stack.md)。

## 鐵律

1. **API 資料一律用 TanStack Query,絕不寫進 Zustand。** Zustand 只放全域 UI 狀態;篩選、分頁、tab 放 URL。
2. **讀取用 `useSuspenseQuery` + 窗格外包 `DataBoundary`;寫入用 `useActionMutation`。** 例外要在 hook 註解寫理由。
3. **依「層」放檔案。** endpoint → `api/`、DTO → `types/api/`、資料 hook → `hooks/`、UI → `components/<domain>/`、
   store → `stores/`;`pages/` 只組裝與放邊界。跨資料夾用 `@/`,同資料夾用 `./`,不准 `../`。
4. **useEffect 預設不用。** 只有同步外部系統(DOM、計時器、訂閱)才用,且一定回傳 cleanup。
5. **畫面上每個字都進 i18n 字典**(含 `aria-label`)。測試斷言也引用字典,不寫死文字。
6. **視覺以 prototype 為準。** 顏色只用 `theme/tokens.ts` 的 token;圖示只用 `@ant-design/icons`,不用 emoji 或文字頂替。
7. **不准新增未經同意的套件、不准寫死色碼、不准在元件裡 import axios 或 `@/api` 的 endpoint module。**
   (後兩條由 lint 擋下。)

## 元件寫法

- 所有函式 `const x = () => {}`;元件 `const X: React.FC<XProps> = (props) => {}`,只用 `export default X`
- props interface 命名 `<元件名>Props`,放在元件正上方;沒有 props 寫 `React.FC`,不造空 interface
- 元件內順序:非 react 的 hook → useId → useRef → useState → useMemo → useEffect → 衍生值 → JSX
  (依賴優先;規則見 [`docs/conventions/components.md`](./docs/conventions/components.md))
- React Compiler 負責 memoization:**不要手寫 `useCallback` / `useMemo` / `React.memo`**,除非 Compiler 處理不了且註解寫明
- 共用零件在 `components/common/`,不手刻:`DataBoundary`、`LoadErrorPanel`、`IconButton`;確認框用 `useConfirmDestructive`
- 權限:路由在 `navEntries.tsx` 設 `permission`;按鈕與區塊用 `<Can>` 包住

## 資料夾速查

```
src/
  api/          apiClient、apiError、各資源的 endpoint module
  app/          Providers、路由表、QueryClient、選單入口 → 頁面對照(navPages)
  components/   common/(共用零件)、layouts/(外殼與選單 navEntries)、auth/、<domain>/
  constants/    routes、permissions、storage key
  hooks/        資料 hook(queryOptions + useSuspenseQuery)、mutation hook、跨元件 UI hook
  i18n/         zhTW.ts(字典形狀來源)、en.ts、useTranslations
  mocks/        MSW handler(pendingHandlers 給開發期與測試;shippedHandlers 只給測試)
  pages/        路由頁面(只組裝)
  stores/       Zustand(只放 UI 狀態)
  test/         測試 setup 與 renderApp
  theme/        tokens(唯一色票來源)、antdTheme、cssVars
  types/api/    與後端逐字一致的 DTO
  utils/        純函式
```

<!-- FILL: 列出本專案預計的 components/<domain>/ 子資料夾(依任務單建立,建立骨架時尚不存在),各用一句話說明。不列骨架的範例 items/。來源:docs/_bootstrap/prototype-analysis.md 的元件清單。 -->

## 本專案特有規則

<!-- FILL: 只列本專案偏離或補充團隊標準的規則,每條連到對應 ADR(docs/adr/0017 起)。至少要有路由模式那一條。沒有其他偏離就只留路由模式。 -->

## 常用指令

| 指令                                | 用途                                                |
| ----------------------------------- | --------------------------------------------------- |
| `npm ci`                            | 依 lockfile 安裝(不要用 `npm install` 安裝既有依賴) |
| `npm run dev` / `npm run dev:mock`  | 開發伺服器 / 以 MSW 假後端開發                      |
| `npm run lint` / `npm run lint:fix` | oxlint + ESLint                                     |
| `npm run typecheck`                 | 型別檢查                                            |
| `npm test`                          | Vitest                                              |
| `npm run build`                     | 正式建置                                            |

## 完成任務前的自我檢查

- [ ] `npm run lint`、`npm run typecheck`、`npm test`、`npm run build` 全部通過
- [ ] 任務單列的每個 scenario 都有對應測試,測試名稱帶 scenario 編號
- [ ] 新增文案都進了 `zhTW.ts` 與 `en.ts`;新的錯誤 code 也進了 `errors.byCode`
- [ ] 新端點:DTO 在 `types/api/`、契約已更新 `docs/api/`、mock handler 進 `pendingHandlers`
- [ ] 與 prototype 不同之處,已寫進規格的「偏離紀錄」
- [ ] 回報:改了哪些檔、每個改動一句話、驗證指令與結果、計畫外的發現

## 文件規則

文件(`AGENTS.md`、`ARCHITECTURE.md`、`CONTEXT.md`、`docs/`)只寫現行規則,不留歷史與日期;每檔 200 行以內。
團隊規範(`docs/conventions/`、`docs/adr/0001–0016`)來自團隊公版,**不在專案內修改**;要偏離就寫新的 ADR。
