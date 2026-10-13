# 0014. 無障礙基線

## 背景

antd 元件本身大多可及,但組合起來之後常出現缺口:純圖示按鈕沒有名稱、自己刻的彈出面板
接不住焦點、對話框關閉後焦點掉回 `<body>`、文字直接寫在 JSX 裡沒有進字典、讀取狀態對螢幕
閱讀器無聲。這些問題都不會讓畫面壞掉,所以不會在一般測試中被發現。

無障礙規則若只在各元件的註解裡,就看不到全貌;跨檔案的約定(例如觸發器與面板之間的焦點
交接)更需要一個集中的地方。

## 決策

以下是每個專案的最低基線。程式碼註解以 `(ADR-0014 §<小節名>)` 引用,`grep` 小節名可以
一次找齊遵守它的地方。

### accessible-name:每個可操作的東西都有名稱

- **純圖示按鈕一律用 `components/common/IconButton`**,`label` 同時當 Tooltip 與
  `aria-label`。不自己組 `Button` + `Tooltip`。
- 沒有可見標籤的輸入元件(搜尋框、`Segmented`、`Select`)帶 `aria-label`。
- `aria-label` 的文字進字典([ADR-0010](0010-ui-copy-in-typed-dictionary.md)):它是使用者
  讀到的文字。
- 圖示只用 `@ant-design/icons`,不用 emoji 或文字符號頂替
  ([ADR-0001](0001-visual-authority-is-the-prototype.md))。

### status-announcement:讀取狀態要被念出來

`SuspenseLoader` 的 fallback 帶 `role="status"`,文案說出在載入什麼(`t.common.loading(what)`)。
錯誤卡用 antd `Result`,主句說出哪一塊失敗。

### page-language:`<html lang>` 跟著介面語言

`app/providers.tsx` 在語言切換時同步 `document.documentElement.lang`,螢幕閱讀器才會用對的
語音念。這是同步外部系統(DOM),所以用 `useEffect`;不要在別處另外設定 `lang`。

### dialog-focus:宣告是 dialog,就負起 dialog 的責任

優先用 antd 的 `Modal` 與 `useConfirmDestructive`,它們已處理焦點。自己刻的彈出面板若宣告
`role="dialog"`:開啟時接住焦點、Escape 關閉、關閉時把焦點**交還給開啟它的按鈕**、Tab 在
內部循環。

### menu-keyboard:選單的鍵盤契約

自訂的選單觸發器要帶 `aria-haspopup` 與 `aria-expanded`(antd 對自訂 child 不會補);
方向鍵在項目間移動、Escape 關閉並把焦點交還觸發器。`role="menu"` 的子節點只能是項目,
標題放在帶 `role="menu"` 的元素外面。

### destructive-confirm:無法復原的動作先確認

刪除這類動作一律經 `useConfirmDestructive`:統一的危險樣式與按鈕文案,鍵盤可以取消。

✅

```tsx
<IconButton danger icon={<DeleteOutlined />} label={t.items.delete.label(item.name)} onClick={confirm} />
<Segmented aria-label={t.header.theme} options={themeOptions} />
```

❌

```tsx
<Button icon={<DeleteOutlined />} onClick={remove} />   {/* 沒有名稱 */}
<span onClick={toggle}>🌙</span>                         {/* 不可聚焦、emoji 頂替圖示 */}
```

### 測試用無障礙查詢

測試以 `getByRole(…, { name })`、`getByLabelText` 定位元件,名稱引用字典。查不到就代表
螢幕閱讀器也找不到——無障礙缺口在測試中直接變成失敗。範本:`ItemsPage.test.tsx`。

規則細節見 [`accessibility.md`](../conventions/accessibility.md)。

## 後果

- 基線的大部分由共用零件(`IconButton`、`SuspenseLoader`、`useConfirmDestructive`)與
  `noBareLiterals` 測試落實,寫新元件時照著用就自然符合。
- **沒有 a11y lint**(未裝 `jsx-a11y`);焦點與鍵盤契約靠 review 與以角色查詢的測試把關。
- 自訂互動元件的成本較高:要自己補焦點管理。優先找 antd 的現成元件。
- 本基線不等於符合 WCAG 的稽核;有法規或客戶要求時另做稽核。

### 何時重新討論

- 專案有明確的無障礙法規要求(例如政府網站、WCAG AA)時,補上 lint 與自動化稽核工具,
  並把本基線擴充成對應的檢核清單。
- 要新增契約時,直接在本 ADR 加一個小節,不另開代號體系;專案特有的契約(例如特殊的拖曳
  分隔線)寫在專案自己的 ADR。
