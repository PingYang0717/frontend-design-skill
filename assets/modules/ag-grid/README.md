# 模組:ag-grid(資料表格)

資料表格用 AG Grid,透過公版 `components/common/DataGrid.tsx`:主題由 `tokens.ts` 推導、內建文案用繁中(有 i18n 時跟語言)、
模組與授權只在 `app/agGrid.ts` 註冊一次;Item 範例的 `ItemTable` 改為 `DataGrid` + `ColDef<Item>[]`。
沒選這個模組時,基底的表格用 antd `Table`。

套用順序第 5 個(最後),要看 i18n 與 dark-mode 有沒有選。

## 細項:Enterprise 或 Community

收件時追問一次(建議 Enterprise),答案寫進 `docs/adr/0022-selected-modules.md` 的「細項」欄。

| 項目                | Enterprise(建議)                                            | Community                                         |
| ------------------- | ----------------------------------------------------------- | ------------------------------------------------- |
| 套件                | 下面四個全裝                                                | 不裝 `ag-grid-enterprise`                         |
| `src/app/agGrid.ts` | `files/` 的版本:`AllEnterpriseModule` + 授權金鑰            | 再疊 `files.community/`:`AllCommunityModule`      |
| 授權金鑰            | `VITE_AG_GRID_LICENSE_KEY`(`.env.example`、`vite-env.d.ts`) | 不需要,兩個檔案都不改                             |
| vite chunk          | `ag-grid`(兩者相同)                                         | 同左                                              |
| 可用功能            | 全部(列分組、樞紐、Excel 匯出、Server-Side Row Model)       | 只有 Community 功能;要用 Enterprise 功能先改 0022 |

## 1. 安裝套件

```bash
# Enterprise
npm install ag-grid-community@^36.2.0 ag-grid-enterprise@^36.2.0 ag-grid-react@^36.2.0 @ag-grid-community/locale@^36.2.0
# Community
npm install ag-grid-community@^36.2.0 ag-grid-react@^36.2.0 @ag-grid-community/locale@^36.2.0
```

## 2. 複製檔案

依序疊,後疊的覆蓋先疊的:

```bash
cp -R <skill>/assets/modules/ag-grid/files/. <project>/
cp -R <skill>/assets/modules/ag-grid/files.with-i18n/. <project>/        # 有選 i18n
cp -R <skill>/assets/modules/ag-grid/files.with-dark-mode/. <project>/   # 有選 dark-mode
cp -R <skill>/assets/modules/ag-grid/files.community/. <project>/        # 選 Community
```

| 檔案                                 | `files/`(沒有 i18n、沒有 dark-mode、Enterprise)                | 變體                                                             |
| ------------------------------------ | -------------------------------------------------------------- | ---------------------------------------------------------------- |
| `src/app/agGrid.ts`                  | 新增:註冊 `AllEnterpriseModule`、讀 `VITE_AG_GRID_LICENSE_KEY` | `files.community/`:註冊 `AllCommunityModule`,沒有金鑰            |
| `src/theme/agGridTheme.ts`           | 新增:`useAgGridTheme()` 回傳由 `TOKENS` 推導的固定主題         | `files.with-dark-mode/`:由 `tokensFor(isDarkMode)` 推導,跟著切換 |
| `src/components/common/DataGrid.tsx` | 新增:公版包裝,內建文案固定繁中(`AG_GRID_LOCALE_TW`)            | `files.with-i18n/`:內建文案跟 `useLanguageStore` 切換            |
| `src/components/items/ItemTable.tsx` | **覆蓋**基底:`DataGrid` + 儲存格元件,文字直接寫繁中            | `files.with-i18n/`:文字引用字典                                  |

`DataGrid` 一律呼叫 `useAgGridTheme()`,所以它只隨 i18n 分兩版,不隨 dark-mode 分。
表格專屬的樣式(列高、表頭、斑馬紋、hover、內距)讀基底 `tokens.ts` 的 `table`,步驟 3 填色票時一併填。

**prototype 也是 AG Grid 時**:只搬它的 `columnDefs`(含 `valueFormatter`、排序 / 篩選設定)與 `withParams` 的值
(照 `standard.md` 第 6.1 節對進 `tokens.table`);不搬它的 theme CSS 檔、`registerModules`、授權金鑰與
它自己的 wrapper 元件,一律過 `DataGrid`。對不到 `tokens.table` 的樣式列待確認,不寫 `.ag-*` 覆寫。

## 3. 修改既有檔案

**`src/app/providers.tsx`**:

1. `import { createQueryClient } from './queryClient';` 的上一行加 `import { registerAgGrid } from './agGrid';`
2. 所有 import 之後、`interface AppProvidersProps` 之前加

   ```tsx
   // AG Grid 的模組與授權只註冊一次;放在這裡,正式畫面與測試(renderApp 也用 AppProviders)走同一條路。
   registerAgGrid();
   ```

**`vite.config.ts`**:

1. `const RC_PATTERN = ...;` 的下一行加

   ```ts
   const AG_GRID_PATTERN = /node_modules[\\/](ag-[^\\/]+|@ag-grid-[^\\/]+[\\/][^\\/]+)[\\/]/;
   ```

2. `groups: [` 的下一行(最前面)加 `{ name: 'ag-grid', test: AG_GRID_PATTERN, priority: 40 },`

**只有 Enterprise**:

- `.env.example` 檔尾加

  ```bash

  # AG Grid Enterprise 授權金鑰(公司統一購買,向前端負責人索取)。沒有時表格帶試用水印,功能不受影響。
  VITE_AG_GRID_LICENSE_KEY=
  ```

- `src/vite-env.d.ts` 的 `ImportMetaEnv` 最後加

  ```ts
    /** AG Grid Enterprise 授權金鑰;沒有時表格帶試用水印。 */
    readonly VITE_AG_GRID_LICENSE_KEY?: string;
  ```

## 4. 測試

不新增測試檔。`ItemsPage.test.tsx` 以儲存格文字與按鈕名稱斷言,antd `Table` 與 `DataGrid` 都適用。
`DataGrid` 在測試環境關閉欄位虛擬化(jsdom 量不到寬度)。

`npm run build` 會對 `ag-grid` chunk 印出「超過 500 kB」的警告:AG Grid 本身就這麼大,屬預期,不算 build 失敗;不要為了消警告調高 `chunkSizeWarningLimit`。
這個 chunk **不是** lazy 載入:`providers.tsx` 在啟動時呼叫 `registerAgGrid()`,所以每一頁都會下載它(`index.html` 會
`modulepreload`)。獨立成 chunk 的好處是快取:只有升級 AG Grid 時才失效,一般發版不必重新下載。

## 5. 與其他模組的互動

| 模組            | 有選時                                                     | 沒選時                                   |
| --------------- | ---------------------------------------------------------- | ---------------------------------------- |
| i18n            | 疊 `files.with-i18n/`:內建文案跟語言、`ItemTable` 引用字典 | 內建文案固定繁中、`ItemTable` 寫繁中字串 |
| dark-mode       | 疊 `files.with-dark-mode/`:表格主題跟著切換                | 主題固定由 `TOKENS` 推導                 |
| msw             | 無                                                         | 無                                       |
| react-hook-form | 無                                                         | 無                                       |

## 6. 規範與 ADR

```bash
cp <skill>/assets/modules/ag-grid/standard.md <project>/docs/conventions/ag-grid.md
cp <skill>/assets/modules/ag-grid/adr.md <project>/docs/adr/0018-ag-grid-for-data-tables.md
```

## 7. 之後的開發

- 新表格:`components/<domain>/<資源>Table.tsx` 用 `DataGrid` + `ColDef<DTO>[]`,操作欄是儲存格元件,寫入按鈕包 `<Can>`
- 不再用 antd `Table`
- 細則見 `docs/conventions/ag-grid.md`
