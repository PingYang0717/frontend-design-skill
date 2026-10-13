# 0008. 元件的宣告與匯出只有一種形式

## 背景

元件的寫法若允許多種形式,代價會在之後才顯現。`export { X }` 與 `export default X` 並存時,
同一個元件在不同呼叫端以兩種寫法出現;`function X(props)` 與 `const X: React.FC<XProps>`
並存時,檔案內的子元件往往把 props inline 在參數上,讀不到也提示不到。元件內部的宣告怎麼排、
何時該獨立成檔,若沒有判準,每個人(與每個 coding agent)都會寫出不同的結果。

## 決策

### 函式

**所有函式一律 `const xxx = () => {}`**——元件、hook、utils、模組私有 helper、mocks 與測試
helper 全部適用。唯一例外是 `ErrorBoundary` class(React 沒有 `componentDidCatch` 的 hook
對等物)。

### 宣告與匯出

- **元件一律 `const X: React.FC<XProps> = (props) => {}`**,包含檔案內的子元件。
- props interface 命名 `<元件名>Props`,**宣告在該元件正上方**。無 props 的元件寫
  `React.FC` 不帶泛型,不造空 interface。
- **元件只用 `export default <元件名>`,不併存具名匯出。** 同檔的型別、跨檔使用的子元件
  仍可具名匯出——這條規則管的是元件本身。default 匯出也正好是 `React.lazy()` 需要的形式。
- 檔案內順序:props interface → 元件內部宣告 → JSX → `export default`。

### 元件內部的宣告順序

1. 不是從 `react` 匯入的 hook(`useTranslations`、`useItems`、`useSearchParams`…)。
   判準是語法:看 import 行,不看它「有沒有去拿資料」。
2. `useId` → `useRef` → `useState` → `useMemo` → `useEffect`(React 內建,依此分組)。
3. render 用的衍生值,緊鄰 `return`。
4. JSX。

**依賴是硬約束。** 輸入是 state 或衍生值的 hook(如 `useDebouncedValue(keyword)`)只能排在
它的輸入之後。不同型別的宣告之間空一行。

### 檔案切分:依用途,不依行數

子元件獨立成檔,只在下列任一成立時:被一個以上的父元件使用;它是 `React.lazy` 的邊界;
它大到會淹沒主元件或帶有自己的生命週期。三者皆不成立就留在唯一的呼叫端旁邊。

✅

```tsx
interface ItemTableProps {
  keyword: string;
}

const ItemTable: React.FC<ItemTableProps> = ({ keyword }) => {
  const items = useItems();
  const t = useTranslations();

  const visibleItems = items.filter((item) => item.name.includes(keyword));

  return <Table<Item> rowKey="id" dataSource={visibleItems} />;
};

export default ItemTable;
```

❌

```tsx
export function ItemTable({ keyword }: { keyword: string }) { … }
export default ItemTable;
```

範本:`src/pages/Items/ItemsPage.tsx`、`src/components/items/ItemTable.tsx`。規則細節見
[`components.md`](../conventions/components.md)、[`naming.md`](../conventions/naming.md)。

## 後果

- 子元件多出許多只有一處使用的 interface;換來的是 props 可讀、可被 IDE 提示。
- `const` 沒有 hoisting。實務上不受影響:子元件的引用都在 render body 裡;真的寫出模組層級
  的前向引用時,TypeScript 會當場報錯。
- **宣告順序、`const` 函式、只用 default 匯出都沒有 lint 強制**,靠 review 與 PR 範本把關。
  oxlint 的 `react/only-export-components` 只擋「元件檔匯出非元件」對 HMR 的影響。
- 重排 `useEffect` 會改變執行順序與 cleanup 順序;整理排列時維持 effect 彼此的相對順序。

### 何時重新討論

- 出現能強制宣告順序或匯出形式的 lint 規則時,改成工具強制,並把本 ADR 的說明縮短。
- React 提供 `componentDidCatch` 的 hook 對等物時,`ErrorBoundary` 改寫並拿掉 class 例外。
