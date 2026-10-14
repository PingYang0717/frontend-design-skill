# 深色模式(模組:dark-mode)

> 選了 dark-mode 模組才有這份規範(`docs/adr/0022-selected-modules.md`)。色票的共通規則見
> [styling-theme.md](./styling-theme.md);這份只寫兩個主題才有的事。

## 1. 兩組 token,一個切換

**規則:** `src/theme/tokens.ts` 有 `LIGHT_TOKENS` 與 `DARK_TOKENS`,由 `tokensFor(isDarkMode)` 取當前主題。
主題狀態只在 `useThemeStore`(`isDarkMode`,persist 到 localStorage);header 的 `ThemeSwitch` 是唯一切換入口。

| 消費端                | 檔案                                                     | 跟著切換的方式                     |
| --------------------- | -------------------------------------------------------- | ---------------------------------- |
| antd `ConfigProvider` | `src/theme/antdTheme.ts` 的 `buildAntdTheme(isDarkMode)` | `providers.tsx` 讀 store 後傳入    |
| CSS Modules           | `src/theme/cssVars.ts` 的 `themeCssText(isDarkMode)`     | 同上,`:root` 的 `--app-*` 整組換掉 |
| AG Grid(選了 ag-grid) | `src/theme/agGridTheme.ts` 的 `useAgGridTheme()`         | hook 內讀 store,`DataGrid` 不用改  |

- 不用 `@media (prefers-color-scheme)` 自己判斷主題:主題只由 store 決定,與 antd 同步。
- 元件與 CSS Module 不讀 `isDarkMode` 來選顏色:顏色一律 `var(--app-*)` 或 antd token,切換時自動跟著變。
- 預設淺色;不讀作業系統偏好(使用者的選擇記在 localStorage)。

## 2. seed token 兩主題都餵亮色值

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

## 3. `DARK_TOKENS` 怎麼填

依 `docs/adr/0022-selected-modules.md` 的「細項」:

| 細項             | 做法                                                                           |
| ---------------- | ------------------------------------------------------------------------------ |
| prototype 有深色 | 逐值照抄 prototype 的深色值;只給部分值時,有給的照抄,沒給的依「保留骨架預設」   |
| 保留骨架預設     | `DARK_TOKENS` 維持骨架的值(antd 預設深色中性色),只填 `LIGHT_TOKENS`            |
| 從淺色推導       | 依下表,從 `LIGHT_TOKENS` 逐值換算,換算結果寫死在 `DARK_TOKENS`(不在執行期計算) |

**從淺色推導的換算**(HSL;H 色相、S 飽和度、L 亮度):

| token                                    | 換算                                                                          |
| ---------------------------------------- | ----------------------------------------------------------------------------- |
| `primary`、`success`、`warning`、`error` | 不換;`DARK_TOKENS` 以 `...LIGHT_TOKENS` 繼承(seed token,見第 2 節)            |
| `bgLayout`、`bgContainer`、`bgElevated`  | 保留淺色值的 H;S 取 min(淺色 S, 15%);L 依序用 0%、8%、12%(骨架預設深色的亮度) |
| `border`、`borderSecondary`              | 同上,L 依序用 26%、19%                                                        |
| `text`、`textSecondary`、`textTertiary`  | `rgba(255, 255, 255, a)`,a 依序 0.85、0.65、0.45                              |
| `borderRadius`、`fontSize`、`fontFamily` | 不換(繼承)                                                                    |

淺色中性色是純灰(S = 0)時,換算結果就是骨架預設值;prototype 的中性色帶色調(例如偏藍的灰)時,深色表面保留同一個色調。
推導出的值在 PR 截圖給 UI/UX 確認,列入回報的「待確認」。

## 4. 新畫面

- 每個新畫面淺色、深色都要看過;PR 有改畫面時附淺色、深色截圖各一張(PR 範本要求)。
- prototype 有、`ThemeTokens` 沒有的 token:兩組都要給值(`ThemeTokens` 型別會逼你補上)。
- 第三方元件只接受顏色字串時,傳 `tokensFor(isDarkMode).xxx`,在呼叫端註解理由;能用 CSS 變數就用 CSS 變數。

## 5. 測試

`src/components/layouts/ThemeSwitch.test.tsx`:切到深色後 `useThemeStore` 變成深色、`:root` 的 CSS 變數換成
`DARK_TOKENS`。新畫面不另寫主題測試;視覺一致性靠 PR 截圖對照 prototype。
