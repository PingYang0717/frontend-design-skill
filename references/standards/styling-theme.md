# 樣式與主題

色票、CSS、圖示的寫法。視覺權威是 prototype,見
[ADR-0001](../adr/0001-visual-authority-is-the-prototype.md)。

## 1. `theme/tokens.ts` 是唯一色票來源

**規則:** 所有顏色、圓角、字級、字型都定義在
[`src/theme/tokens.ts`](../../src/theme/tokens.ts) 的 `LIGHT_TOKENS` / `DARK_TOKENS`。
這張表餵三個消費端,全部由它**推導**,不另外維護:

| 消費端                | 檔案                                                         | 產物                      |
| --------------------- | ------------------------------------------------------------ | ------------------------- |
| antd `ConfigProvider` | `src/theme/antdTheme.ts` 的 `buildAntdTheme(isDarkMode)`     | antd 元件的 token         |
| CSS Modules           | `src/theme/cssVars.ts` 的 `themeCssText(isDarkMode)`         | `:root { --app-*: … }`    |
| AG Grid(`DataGrid`)   | `src/theme/agGridTheme.ts` 的 `buildAgGridTheme(isDarkMode)` | Theming API 的 theme 物件 |

**原因:** 每個消費端各抄一份,改色時一定漏一邊;只有一張表,深淺兩主題與 antd / AG Grid / 自寫元件才會一致。

❌ 錯誤:在元件、CSS Module、`index.css` 寫 `#1677ff`、`rgba(0,0,0,.45)`、`white`。
工具管不到這條,靠 review 與 PR 範本的自我檢查。

## 2. 數值從 prototype 逐值擷取

**規則:** 新專案收件時,依 prototype 的 design token 表,把 `LIGHT_TOKENS` 與 `DARK_TOKENS`
的每個值**逐值**換成 prototype 的值(light、dark 各一組)。不要用 antd 演算法推導出「差不多」
的顏色,也不要目測取色。

**原因:** antd 預設深色表面色(`#000000` / `#141414` / `#1f1f1f`)通常與設計稿不同,差一點點
的灰色在並排時一眼就看得出來;使用者驗收的對象是 prototype。

- prototype 有、`ThemeTokens` 沒有的 token:先在 `ThemeTokens` 加欄位,再到 `cssVars.ts` 的
  `CSS_VAR_NAMES` 加對應變數名(`Record<keyof ThemeTokens, string>` 會逼你補上),需要的話
  在 `antdTheme.ts` 對應到 antd token。
- 字型堆疊只在 `tokens.ts` 的 `FONT_FAMILY` 寫一次。

## 3. seed token 兩主題都餵亮色值

**規則:** antd 的 seed token(`colorPrimary`、`colorSuccess`、`colorWarning`、`colorError`)
兩個主題都餵 `LIGHT_TOKENS` 的值;map / alias token(表面、邊框、文字)直接餵當前主題的值。

**原因:** antd 的 `darkAlgorithm` 會從 seed 推導深色色盤;餵已經變暗的值,會被**再暗一次**。
map / alias token 在推導之後才套用,所以要給最終值。

✅ 正確(`src/theme/antdTheme.ts`)

```ts
colorPrimary: LIGHT_TOKENS.primary,   // seed:永遠亮色
colorBgContainer: tokens.bgContainer, // map/alias:當前主題
```

❌ 錯誤

```ts
colorPrimary: tokens.primary, // 深色主題若給了暗色主色,會被 darkAlgorithm 再壓暗
```

## 4. CSS 變數宣告在 `:root`

**規則:** `--app-*` 變數由 `AppProviders` 渲染一段 `<style>{themeCssText(isDarkMode)}</style>`,
宣告在 `:root`,不掛在某個 wrapper `<div>` 上。

**原因:** 對話框、下拉選單、Tooltip 都 portal 到 `document.body`,在 wrapper 之外;變數掛在
wrapper 上,這些浮層會讀不到,深色模式時安靜地停在 fallback 值。

## 5. CSS Modules

**規則:**

- 元件樣式寫在同資料夾的 `<元件名>.module.css`,以相對路徑 `import styles from './X.module.css'`。
- 顏色、圓角、字型一律 `var(--app-*)`;變數必須存在於 `CSS_VAR_NAMES`,不寫 fallback 色碼。
- class 名稱用 camelCase(`styles.technical`)。
- 全域樣式只放 `src/index.css`:重設、`body` 底色與字色、CSS Module 碰不到的 antd portal 元素外框。
- 先用 antd 元件的 props 與 token 達成設計;做不到才寫 CSS。不要用 `:global(.ant-…)` 覆寫 antd
  內部結構(升級時選擇器會靜靜失效)。

✅ 正確(`src/components/common/LoadErrorPanel.module.css`)

```css
.technical {
  color: var(--app-color-text-secondary);
  word-break: break-all;
}
```

❌ 錯誤

```css
.technical {
  color: var(--app-color-text-secondary, #8c8c8c); /* fallback 色碼:變數漏了也看不出來 */
}
.title :global(.ant-card-head-title) {
  color: #000;
}
```

## 6. 間距與版面

**規則:** 排版優先用 antd 的 `Flex`、`Space`、`Row/Col` 與其 `gap` prop(例如
`<Flex vertical gap={16}>`);頁面骨架的 padding 寫在 CSS Module。間距數值以 prototype 為準。

## 7. 圖示

**規則:**

- 圖示只用 `@ant-design/icons`。
- **禁止 emoji 與文字符號頂替圖示**(`✕`、`→`、`⋯`、`+`)。
- prototype 的圖示在 `@ant-design/icons` 找不到對應時,挑最接近的並在 PR 的「偏離設計稿」欄註明;
  不自行引入其他圖示庫。
- 純圖示按鈕一律用 `IconButton`(見 [accessibility.md](./accessibility.md))。

**原因:** emoji 在不同作業系統長得不一樣、顏色不跟主題、螢幕閱讀器會念出「十字標記」這類字。

✅ 正確

```tsx
<IconButton danger icon={<DeleteOutlined />} label={t.items.delete.label(item.name)} />
```

❌ 錯誤

```tsx
<Button type="text">🗑</Button>
<Button type="text">✕</Button>
```

## 8. antd 元件的 `color` prop

**規則:** `Tag`、`Badge` 這類元件的 `color` 只用 antd **語意色名**:`success`、`warning`、`error`、
`processing`、`default`。不用具名色(`green`、`red`、`blue`…),也不傳色碼。

**原因:** 語意色名由 theme token(`colorSuccess` 等)推導,跟著 `tokens.ts` 與深淺主題變;
具名色是 antd 內建色盤,不受 token 管,換了主色或切深色就與設計稿脫節。

✅ 正確(`src/components/items/ItemTable.tsx`)

```tsx
<Tag color={item.status === 'ACTIVE' ? 'success' : 'default'}>{t.items.status[item.status]}</Tag>
```

❌ 錯誤:`<Tag color="green">`、`<Tag color="#52c41a">`

## 9. 何時可以用 inline style

**規則:** 預設不用 `style={{ … }}`。只有以下情況可以,且值仍須來自 token 或計算結果:

1. **執行期才知道的數值**:拖曳寬度、進度百分比、依資料計算的位置。
2. 第三方元件只接受 `style` prop、沒有 `className` 可用。

✅ 正確

```tsx
<div className={styles.bar} style={{ width: `${percent}%` }} />
```

❌ 錯誤

```tsx
<div style={{ padding: 24, color: '#666' }} />  {/* 靜態樣式:寫進 CSS Module */}
```

## 10. 深淺主題

- 主題狀態在 `useThemeStore`(`isDarkMode`,persist 到 localStorage)。
- 新加的畫面兩個主題都要看過;PR 有改畫面時附淺色、深色截圖各一張(PR 範本要求)。
- 不用 `@media (prefers-color-scheme)` 自己判斷主題:主題只由 store 決定,與 antd 同步。
