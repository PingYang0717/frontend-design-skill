# 無障礙(Accessibility)

無障礙是基本要求,不是加分項。lint 不檢查 a11y,這裡的規則靠元件封裝、測試(以 role 與
name 查詢元素)與 review 把關。決策背景見 [ADR-0014](../adr/0014-accessibility-baseline.md)。

## 1. 純圖示按鈕必有名稱:用 `IconButton`

**規則:** 沒有文字的按鈕一律用 `src/components/common/IconButton.tsx`,`label` 必填,同時當
Tooltip 與 `aria-label`。不要自己組 `Button` + `Tooltip`。

**原因:** 沒有名稱的按鈕,螢幕閱讀器只會念「按鈕」;Tooltip 只對指標使用者有用。`IconButton`
把兩者綁在一起,`label` 是必填 prop,漏寫直接 typecheck 失敗。

✅ 正確

```tsx
<IconButton
  icon={isSiderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
  label={t.nav.toggleSider}
  onClick={() => setSiderCollapsed(!isSiderCollapsed)}
/>
```

❌ 錯誤

```tsx
<Tooltip title="刪除">
  <Button type="text" icon={<DeleteOutlined />} /> {/* 沒有 aria-label */}
</Tooltip>
```

- 同類按鈕在清單裡重複出現時,名稱要能區分:`t.items.delete.label(item.name)` →「刪除 範例項目 A」,
  而不是每列都叫「刪除」。
- `label` 的文字進字典(見 [i18n.md](./i18n.md))。

## 2. antd 按鈕的 `autoInsertSpace` 關閉

**規則:** `AppProviders` 設定 `<ConfigProvider button={{ autoInsertSpace: false }}>`,不得移除。

**原因:** antd 預設在兩個中文字的按鈕中間插入空白(「新 增」)。螢幕閱讀器會讀到那個空白
(念成兩個字),測試用 `getByRole('button', { name: '新增' })` 也會找不到。

## 3. 表單欄位都有標籤

**規則:** 每個輸入元件都要有可存取的名稱:

- 表單欄位用 `FormField`:它以 `htmlFor` / `id` 把 `label` 關聯到輸入元件,`getByLabelText` 找得到([forms.md](./forms.md))。
- 沒有可見標籤的輸入(搜尋框、header 的選擇器)加 `aria-label`。
- `placeholder` 不能取代標籤(輸入後就消失)。

✅ 正確

```tsx
<Input.Search aria-label={t.common.search} placeholder={t.items.searchPlaceholder} … />
<Select aria-label={t.header.language} … />
```

❌ 錯誤

```tsx
<Input placeholder="依名稱搜尋" />
```

- 驗證錯誤訊息由 `FormField` 顯示在 `Form.Item` 的 `help`(antd 會關聯到欄位),文字來自 `rules` 並進字典。

## 4. 鍵盤可達

**規則:**

- 所有可以用滑鼠做的事,都要能用鍵盤完成。可點的東西用 `<button>` / antd `Button` / 連結,
  **不要**在 `div`、`span` 上掛 `onClick`。
- 不移除焦點外框(不寫 `outline: none` 而不提供替代樣式)。
- 不設定正數的 `tabIndex`;焦點順序跟著 DOM 順序。
- 對話框:開啟時焦點進入對話框、Esc 可關閉、關閉後焦點回到開啟它的按鈕。antd `Modal` 已處理,
  自寫的浮層要做到同樣的事。
- 自訂互動元件(可拖移分隔線、自訂選單)要依 WAI-ARIA Authoring Practices 實作對應的鍵盤操作與
  `aria-*` 屬性,並在 PR 說明。

✅ 正確

```tsx
<Button type="link" onClick={openDetail}>
  {item.name}
</Button>
```

❌ 錯誤

```tsx
<div className={styles.row} onClick={openDetail}>
  {item.name}
</div>
```

## 5. Live region:狀態變化要被聽到

**規則:**

- 載入中的區塊有 `role="status"`(`SuspenseLoader` 已處理),文字來自 `t.common.loading(what)`。
- 操作結果(成功、失敗)走 antd `message`(`App.useApp()`),它會被螢幕閱讀器播報。
- 自己加 live region 時:
  - 一般狀態用 `role="status"`(polite);只有需要立刻打斷的錯誤才用 `role="alert"`。
  - **只播報完整、最終的結果一次**。不要把會頻繁變動的內容(計時器、逐字更新的文字、每次按鍵
    的搜尋結果數)包在 live region 裡,否則會被逐次重念。
  - 搜尋結果數之類的播報,綁在 debounce 後的值上。

**原因:** 視覺使用者靠「看到東西變了」得知結果;螢幕閱讀器使用者只能靠播報。播報太少聽不到結果,
播報太多則完全無法使用。

## 6. 語意與結構

- 頁面標題用 antd `Card` 的 `title` 或 `Typography.Title`,層級連續,不為了字級跳級。
- 版面區塊用 antd `Layout.Header` / `Layout.Sider` / `Layout.Content`(輸出 `header`、`aside`、`main`)。
- `<html lang>` 已由 `AppProviders`(`src/app/providers.tsx`)以 `useEffect` 同步成目前介面語言,
  螢幕閱讀器才會用對的語音念;不要在別處另外改 `document.documentElement.lang`。
- 圖片要有 `alt`;純裝飾的圖示不需要另外加名稱(名稱由包住它的按鈕提供)。

## 7. 顏色與對比

- 文字與背景的對比依 WCAG AA(一般文字 4.5:1、大字 3:1)。prototype 的色票若不足,在 PR 的
  「偏離設計稿」欄提出,不要自己偷改 token。
- **不只用顏色傳達資訊**:狀態除了顏色還要有文字(`<Tag color="success">` 內顯示 `t.items.status[…]`),錯誤除了
  紅框還要有訊息。
- 深淺兩個主題都要檢查。

## 8. 測試就是無障礙檢查

**規則:** 測試以 `getByRole(…, { name })` 與 `getByLabelText` 查詢元素(見 [testing.md](./testing.md))。
找不到就代表使用輔助科技的人也找不到——補名稱,而不是改用 `data-testid` 或 class 選擇器。
