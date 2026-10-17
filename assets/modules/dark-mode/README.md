# 模組:dark-mode(深色模式)

`theme/tokens.ts` 有淺色、深色兩組 token,header 有淺色 / 深色切換,選擇記在 `useThemeStore`(localStorage);
antd 主題、`--app-*` CSS 變數(選了 ag-grid 還有表格主題)跟著切換。
沒選這個模組時,基底只有一組 `TOKENS`,沒有 `useThemeStore` 也沒有切換。

套用順序第 2 個(在 i18n 之後)。

## 細項:prototype 沒給深色時

收件時追問一次,答案寫進 `docs/adr/0022-selected-modules.md` 的「細項」欄:

| 選項                 | 做法                                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| 保留骨架預設(建議)   | `DARK_TOKENS` 維持 `files/` 裡的值(antd 預設深色中性色),主色等 seed token 與淺色共用                       |
| 從淺色推導           | 依 `docs/conventions/dark-mode.md` 第 3 節,從 prototype 的淺色值逐一換算                                   |
| (prototype 有給深色) | 不用追問;`DARK_TOKENS` 逐值照抄 prototype(React 原始碼的深色通常是第二組 theme 物件或 `[data-theme]` 分支) |

## 1. 安裝套件

不需要。

## 2. 複製檔案

```bash
cp -R <skill>/assets/modules/dark-mode/files/. <project>/
# 有選 i18n 時再疊:
cp -R <skill>/assets/modules/dark-mode/files.with-i18n/. <project>/
```

`files/` 的內容:

| 檔案                                             | 說明                                                                                |
| ------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `src/stores/useThemeStore.ts`                    | 新增:`isDarkMode`,persist 到 localStorage                                           |
| `src/theme/tokens.ts`                            | **覆蓋**基底:`TOKENS` 改為 `LIGHT_TOKENS` + `DARK_TOKENS` + `tokensFor(isDarkMode)` |
| `src/theme/antdTheme.ts`、`src/theme/cssVars.ts` | **覆蓋**基底:`buildAntdTheme(isDarkMode)`、`themeCssText(isDarkMode)`               |
| `src/components/layouts/ThemeSwitch.tsx`         | 新增:header 的淺色 / 深色切換(`Segmented`)                                          |
| `src/components/layouts/ThemeSwitch.test.tsx`    | 新增:切到深色後 store 與 CSS 變數跟著變                                             |

`files.with-i18n/` 只有 `ThemeSwitch.tsx` 與它的測試:文字改引用字典。

套用時機是步驟 3 填色票**之前**,所以覆蓋 `tokens.ts` 不會蓋掉已填的值。已經填過 `TOKENS` 的專案要後加這個模組時,
先把舊的 `TOKENS` 值抄進新檔的 `LIGHT_TOKENS`。

## 3. 修改既有檔案

**`src/constants/storage.ts`**:在 `LAYOUT_STORAGE_KEY` 上一行加

```ts
export const THEME_STORAGE_KEY = `${PREFIX}:theme`;
```

**`src/app/providers.tsx`**:

1. `import { buildAntdTheme } ...` 的上一行加 `import { useThemeStore } from '@/stores/useThemeStore';`
   (有 i18n 時放在 `useLanguageStore` 那行的下一行,維持字母順序)
2. 元件內最前面的 store hook 區加 `const isDarkMode = useThemeStore((state) => state.isDarkMode);`(已選 i18n 時放在
   `const language = …` 的上一行)
3. `buildAntdTheme()` 改成 `buildAntdTheme(isDarkMode)`;`themeCssText()` 改成 `themeCssText(isDarkMode)`

**`src/components/layouts/AppHeader.tsx`**:

1. `import { useLayoutStore } from '@/stores/useLayoutStore';` 的下一行加 `import ThemeSwitch from './ThemeSwitch';`
2. `{/* 右側工具列` 那行註解的下一行加 `<ThemeSwitch />`

**有選 i18n 時,字典**:`src/i18n/zhTW.ts` 與 `en.ts` 的 `header` 最前面加三條

```ts
// zhTW.ts
theme: '主題',
light: '淺色',
dark: '深色',
// en.ts
theme: 'Theme',
light: 'Light',
dark: 'Dark',
```

**`.azuredevops/pull_request_template.md`**:「有改畫面就附截圖」改成「有改畫面就附截圖(淺色 / 深色各一張)」。

## 4. 測試

新增 `ThemeSwitch.test.tsx`(在 `files/` 或 `files.with-i18n/` 裡)。它只用 `renderApp('/')`,有沒有選 msw 都能跑。

## 5. 與其他模組的互動

| 模組    | 互動                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------ |
| i18n    | 有選:多疊 `files.with-i18n/`,並在字典加 `header.theme/light/dark`;沒選:`files/` 的繁中字串直接用 |
| ag-grid | 選了 dark-mode 時,ag-grid 要多疊它的 `files.with-dark-mode/`(表格主題跟著切換)                   |
| 其他    | 無                                                                                               |

## 6. 規範與 ADR

```bash
cp <skill>/assets/modules/dark-mode/standard.md <project>/docs/conventions/dark-mode.md
```

這個模組沒有基線 ADR;採用與否、深色細項的理由寫在 `docs/adr/0022-selected-modules.md`。

## 7. 之後的開發

- 色票:步驟 3 填 `LIGHT_TOKENS`,`DARK_TOKENS` 依上面的細項填
- 驗收:`npm run dev`(或 `dev:mock`)淺色、深色各看過一次每個畫面
- 細則見 `docs/conventions/dark-mode.md`
