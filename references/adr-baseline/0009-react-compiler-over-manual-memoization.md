# 0009. 用 React Compiler 取代手寫 memoization

## 背景

React 18 以前,避免不必要的重繪要靠手寫 `useCallback`、`useMemo`、`React.memo`。這套做法
有三個問題:

- **規則容易寫、不容易守。**「傳給子元件的 handler 一律 `useCallback`」只要有一層漏了,
  下游的 `React.memo` 就全部失效,而且不會有任何錯誤。
- **依賴陣列是另一個 bug 來源。** 少寫一個依賴是 stale closure,多寫一個是 memo 失效。
- **噪音。** 元件裡一半的行數在處理身分穩定,讀的人看不到真正的邏輯。

React 19 搭配 React Compiler 在建置期分析元件,自動加上等效的 memoization,粒度比手寫更細。

## 決策

**1. 開啟 React Compiler。** `vite.config.ts` 以 `@rolldown/plugin-babel` 套用
`reactCompilerPreset()`(`babel-plugin-react-compiler`)。

**2. 不再要求手寫 `useCallback` / `useMemo` / `React.memo`。** handler 直接寫 inline 或
`const`,昂貴計算直接寫在 render 裡。

**3. 只有 Compiler 處理不了時才手動加,並在旁邊註解理由。** 典型情況:

- ESLint 的 `react-hooks/incompatible-library` 或 `react-hooks/unsupported-syntax` 對該處
  發出警告,Compiler 因此跳過這個元件。
- 值要當成外部系統的穩定身分(例如傳給第三方函式庫做相等比較),而 Compiler 沒有保證。

**4. Compiler 的規則由 ESLint 檢查。** `eslint-plugin-react-hooks` 的 recommended 設定
(含 Compiler 相關規則:`purity`、`immutability`、`refs`、`set-state-in-render`…)全部
啟用,`rules-of-hooks` 交給 oxlint 報 error。

✅

```tsx
// components/items/ItemTable.tsx:沒有 useMemo,Compiler 會處理
const normalizedKeyword = keyword.trim().toLowerCase();
const visibleItems = normalizedKeyword
  ? items.filter((item) => item.name.toLowerCase().includes(normalizedKeyword))
  : items;
```

```tsx
<IconButton icon={<MenuFoldOutlined />} label="收合或展開側欄" onClick={() => setSiderCollapsed(!isSiderCollapsed)} />
```

❌

```tsx
// 沒有理由的手寫 memoization
const handleClick = useCallback(() => setOpen(true), []);
const visibleItems = useMemo(() => items.filter(…), [items, keyword]);
export default React.memo(ItemTable);
```

✅ 例外要寫理由:

```tsx
// Compiler 跳過此元件(react-hooks/incompatible-library:某表格函式庫回傳的 API 不可 memo),
// 欄位定義需要穩定身分,否則表格每次 render 都重建內部狀態。
const columns = useMemo(() => buildColumns(t), [t]);
```

規則細節見 [`components.md`](../conventions/components.md)、[`tooling.md`](../conventions/tooling.md)。

## 後果

- 元件更短、只剩邏輯;「漏一層 `useCallback`」這類 bug 不再存在。
- **Compiler 假設元件與 hook 遵守 React 的規則**(render 是純的、不在 render 中改 props 或
  ref)。違反時 Compiler 可能默默跳過該元件,或產生與預期不同的快取行為。ESLint 的
  react-hooks 規則是第一道防線。
- 目前 react-hooks 規則在 `eslint.config.js` 全部降為 warn:不擋 commit 與 CI,warning
  必須在 PR 中處理或註解說明。
- 除錯時看到的編譯後程式碼與原始碼不同;React DevTools 會標示被 Compiler 處理過的元件。
- 效能問題的排查方式改變:先確認 Compiler 有沒有處理那個元件,再考慮手動介入。

### 何時重新討論

- Compiler 在某類元件上反覆被跳過或產生錯誤行為時,記錄案例,評估該區域停用
  (`'use no memo'`)或整體回退。
- react-hooks 的 Compiler 規則穩定、誤報少之後,考慮把它們從 warn 升為 error。
