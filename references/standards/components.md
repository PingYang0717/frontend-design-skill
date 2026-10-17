# 元件撰寫

> 決策理由見 [ADR-0008](../adr/0008-component-declaration-and-export.md)(宣告與匯出)、
> [ADR-0009](../adr/0009-react-compiler-over-manual-memoization.md)(React Compiler)。
> 範本:`src/components/items/ItemTable.tsx`(骨架的範例功能)、`src/pages/Items/ItemsPage.tsx`(骨架的範例功能)。

## 1. 所有函式寫成 `const x = () => {}`

**規則**:元件、hook、utils、模組私有 helper、mock 與測試 helper 一律 arrow function。
唯一例外:`ErrorBoundary`(class component,React 沒有 `componentDidCatch` 的 hook 對等物)。

**原因**:一種寫法,沒有 hoisting 差異,也不用討論「這裡該用哪種」。

- ✅ `export const apiPath = (...segments: Array<string | number>): string => ...`
- ❌ `export function apiPath(...segments) { ... }`

## 2. 元件宣告:`React.FC<XProps>` + 具名 props interface

**規則**

- `const X: React.FC<XProps> = (props) => {}`,檔案內的子元件也一樣。
- props interface 命名 `<元件名>Props`,宣告在該元件**正上方**。
- 沒有 props 的元件寫 `React.FC`,不帶泛型、不造空 interface。
- 需要 `children` 時在 interface 明寫 `children: ReactNode`。
- **例外:泛型元件**(模組提供的 `DataGrid<TData>`、`FormField<TValues, TName>`)無法寫成 `React.FC<XProps>`,改寫
  `const X = <T,>(props: XProps<T>) => {}`,props interface 仍放正上方;只有 `components/common/` 的公版零件可以。

**原因**:型別一眼可見;interface 與元件相鄰,改 props 時不用跳檔。

```tsx
// ✅ src/components/items/ItemTable.tsx
interface ItemTableProps {
  /** 已 debounce 的搜尋字串。 */
  keyword: string;
}

const ItemTable: React.FC<ItemTableProps> = ({ keyword }) => {
```

```tsx
// ✅ 無 props
const DashboardPage: React.FC = () => {

// ❌
interface DashboardPageProps {}
function ItemTable({ keyword }: { keyword: string }) {
```

## 3. 匯出只用 `export default`

**規則**:元件只有 `export default <元件名>` 一種匯出,放在檔案最後一行。同檔的型別可以具名匯出。
hook、utils、store、常數檔沒有 default export,一律具名匯出。

**原因**:一個元件檔只有一個進入點,import 名稱與檔名一致。

- ✅ `export default ItemTable;` → `import ItemTable from '@/components/items/ItemTable';`
- ❌ `export const ItemTable: React.FC = ...` 與 `export default ItemTable` 並存

**強制**:oxlint `react/only-export-components`(warn)會提示元件檔混入非元件匯出。

## 4. 檔案內順序

**規則**:import → props interface → 元件(內部依第 5 節順序)→ `export default`。

## 5. 元件內部宣告順序

**規則**:依序

1. 非 `react` 匯入的 hook(`useItems`、`useSearchParams`、`Form.useForm`、選了 i18n 時的 `useTranslations`…)
2. `useId`
3. `useRef`
4. `useState`
5. `useMemo`(只在第 7 節允許的情況)
6. `useEffect`
7. render 用的衍生值、事件處理函式
8. JSX

不同種類的宣告之間空一行。判準看語法:import 行寫得出來的自訂 hook(包括 `useDebouncedValue`)屬於第 1 組;
但若它依賴下方的 state 或衍生值,依賴優先,放在它依賴的東西之後。

**原因**:hook 的呼叫順序固定,讀者知道去哪裡找狀態;依賴在上、消費者在下。

```tsx
// ✅ src/pages/Items/ItemsPage.tsx
const [searchParams, setSearchParams] = useSearchParams();

const [isCreateOpen, setCreateOpen] = useState(false);

const keyword = searchParams.get('q') ?? '';
const debouncedKeyword = useDebouncedValue(keyword); // 依賴 keyword,所以排在它後面
```

**強制**:沒有 lint 能檢查,靠 review。`react/rules-of-hooks`(oxlint)只擋條件式呼叫 hook。

## 6. `useEffect` 預設不用

**規則**:寫 `useEffect` 前先確認是不是下列情況,是的話不用 effect:

| 情況                        | 改用                                                   |
| --------------------------- | ------------------------------------------------------ |
| 從 props / state 算出來的值 | render 時直接算(衍生值)                                |
| 回應使用者操作              | event handler                                          |
| 抓資料                      | TanStack Query([data-fetching.md](./data-fetching.md)) |
| props 變了要重設 state      | 給元件 `key`                                           |

只有「與外部系統同步」(計時器、DOM API、訂閱)才用 `useEffect`,而且建立的東西一律回傳 cleanup。

```ts
// ✅ src/hooks/useDebouncedValue.ts
// 同步外部系統(計時器),需要 cleanup。
useEffect(() => {
  const timer = window.setTimeout(() => setSettled(value), delayMs);
  return () => window.clearTimeout(timer);
}, [value, delayMs]);
```

```tsx
// ❌ 用 effect 計算衍生值
const [visibleItems, setVisibleItems] = useState<Item[]>([]);
useEffect(() => {
  setVisibleItems(items.filter((item) => item.name.includes(keyword)));
}, [items, keyword]);
```

**強制**:ESLint `react-hooks` recommended(含 `set-state-in-effect` 等 Compiler 規則)以 warn 提示。

## 7. 不手寫 memoization(React Compiler)

**規則**:不寫 `useCallback`、`useMemo`、`React.memo`。React Compiler(`vite.config.ts` 的
`reactCompilerPreset`)在建置時自動處理。只有在 Compiler **確實無法處理**時才手動加,並在該行上方註解理由
(例如:Compiler 對該元件 bail out、第三方套件要求參照穩定)。

**原因**:手動 memo 容易漏依賴、增加 review 成本;Compiler 做得比人一致。

- ✅ 直接寫 `const visibleItems = items.filter(...)`、`onClick={() => setCreateOpen(true)}`
- ❌ `const onClose = useCallback(() => setCreateOpen(false), []);`(沒有理由的手動 memo)

**強制**:ESLint `react-hooks` 的 Compiler 規則會提示 Compiler 無法最佳化的寫法(warn);出現時先改寫法,
改不了才手動 memo。

## 8. 共用零件,不手刻

| 需求                                 | 用                                                                          |
| ------------------------------------ | --------------------------------------------------------------------------- |
| 純圖示按鈕(帶 Tooltip 與 aria-label) | `components/common/IconButton`                                              |
| 資料表格                             | antd `Table`;選了 ag-grid 用 `components/common/DataGrid`                   |
| 表單欄位                             | antd `Form.Item name`;選了 react-hook-form 用 `components/common/FormField` |
| 讀取中 / 讀取失敗的邊界              | `components/common/DataBoundary`                                            |
| 讀取失敗的錯誤卡                     | `components/common/LoadErrorPanel`(由 `ErrorBoundary` 使用)                 |
| 刪除等不可復原動作的確認             | `hooks/useConfirmDestructive`                                               |
| 被閘門擋住的整頁遮罩                 | `components/common/AccessMask`(`AppProviders` 已掛,不用自己放)              |
| 依權限顯示(選了 permissions 模組)    | `components/auth/RequirePermission`(`permissions.md`)                       |
| 搜尋輸入 debounce(300–500ms)         | `hooks/useDebouncedValue`                                                   |

- ✅ ``<IconButton icon={<DeleteOutlined />} label={`刪除 ${item.name}`} onClick={...} />``
- ❌ `<Tooltip title="刪除"><Button icon={<DeleteOutlined />} /></Tooltip>`(沒有 aria-label、每列名稱都一樣)
- ❌ `Modal.confirm({ title: '確定刪除?' })`(直接開,按鈕文案與危險樣式不一致)

新增共用零件時放 `components/common/`,並補進本表。

## 9. 頁面只組裝

**規則**:`pages/` 只做三件事:組裝元件、放 `DataBoundary`、讀寫 URL state。資料抓取與業務邏輯在 hook 與元件。

- ✅ `ItemsPage` 讀 `?q=`、包 `<DataBoundary what="項目">`、放 `<ItemTable keyword={...} />`
- ❌ 在頁面裡 `useSuspenseQuery`、過濾資料、組 columns

## 10. 表單與表格

**規則**:依 `docs/adr/0022-selected-modules.md`,一個專案只用一套,不混用。

| 需求 | 沒選模組(基底)                                                                                                                                        | 選了模組                                                                   |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 表單 | antd `Form.useForm<Request 型別>()` + 一個欄位一個 `Form.Item name`,驗證寫 `rules`;送出用 `onFinish`                                                  | react-hook-form:`useForm` + 一個欄位一個 `FormField`(`react-hook-form.md`) |
| 表格 | antd `Table<DTO>`,欄位定義 `TableColumnsType<DTO>`,`rowKey` 用 id;操作欄的 `render` 回傳元件(選了 permissions 模組時寫入按鈕包 `<RequirePermission>`) | ag-grid:`DataGrid` + `ColDef<DTO>[]`(`ag-grid.md`)                         |

- 表單型別用 `types/api/` 的 request 型別;送出用 mutation 的 `mutateAsync`,失敗時對話框保持開啟、輸入不消失
- 對話框裡的 antd 表單加 `clearOnDestroy`,關閉後下次打開是空白的
- 表格的操作欄抽成小元件(例如 `ItemActions`),在裡面呼叫 mutation hook,不在 `columns` 的 `render` 裡直接呼叫 hook

範本:`src/components/items/ItemCreateDialog.tsx`、`src/components/items/ItemTable.tsx`(骨架的範例功能,已是所選模組的版本)。

## 11. Lazy 載入

**規則**:`React.lazy` 只用於路由頁面(`app/navPages.tsx`)與笨重的第三方元件;一般元件直接 import。
lazy 元件外層要有 `Suspense`(頁面由 `AppShell` 的 `DataBoundary` 提供)。
