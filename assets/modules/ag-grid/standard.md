# 資料表格(模組:ag-grid)

> 選了 ag-grid 模組才有這份規範(`docs/adr/0022-selected-modules.md`,細項記 Enterprise 或 Community)。
> 資料表格一律用 AG Grid,透過骨架的 `components/common/DataGrid` 使用。決策理由見
> [ADR-0018](../adr/0018-ag-grid-for-data-tables.md)。範本:`src/components/items/ItemTable.tsx`(骨架的範例功能)。
>
> **狀態:初版。** 欄位預設、常用的 Enterprise 功能(分群、側欄、匯出)與既有專案的實際用法,待舊專案審查後補上;
> 本檔標「待補」的段落就是缺口。

## 1. 什麼時候用 `DataGrid`,什麼時候用 antd `Table`

**規則:**

| 畫面上的東西                                                 | 用                            |
| ------------------------------------------------------------ | ----------------------------- |
| 資料清單:多列同形資料,有排序、篩選、分頁、選取、匯出的任一種 | `DataGrid`(AG Grid)           |
| 只有幾列、沒有任何互動的摘要表(例如詳細頁的「屬性 / 值」)    | antd `Descriptions`           |
| antd `Table`                                                 | **不用**;既有程式碼遇到就改掉 |

選 Community 時,Enterprise 才有的功能(分群、樞紐、側欄、Excel 匯出、Server-Side Row Model)不能用;
真的需要時先新增 ADR 取代 0022 改選 Enterprise,不要自己加 `ag-grid-enterprise`。

**原因:** 一種表格一種寫法。兩套表格並存,排序圖示、篩選位置、選取框的樣子都會不一樣,使用者在同一個系統裡
會感受到兩種表格;AG Grid 的 Enterprise 功能(分群、側欄、Excel 匯出、Server-Side Row Model)也是 antd `Table`
做不到的。

## 2. 一律透過 `components/common/DataGrid`

**規則:** 元件不直接 import `AgGridReact`;用 `DataGrid`,只傳 `rowData`、`columnDefs`、`getRowId`
與該表格特有的設定。`DataGrid` 負責:

- 主題:`theme/agGridTheme.ts` 的 `useAgGridTheme()` 由 `tokens.ts` 推導;選了 dark-mode 時跟著深淺模式切換
  ([styling-theme.md](./styling-theme.md))
- 內建文案:`@ag-grid-community/locale` 的 `AG_GRID_LOCALE_TW`;選了 i18n 時與 `AG_GRID_LOCALE_EN` 跟著介面語言切換
- 版面:`domLayout="autoHeight"`,表格高度跟著資料長
- 欄位預設:`flex: 1`、`minWidth: 120`、可排序、可調寬

**原因:** 預設集中一處,所有表格長得一樣;升級 AG Grid 或改主題時只改 `DataGrid` 與 `agGridTheme.ts`。

✅ 正確

```tsx
<DataGrid<Item>
  rowData={visibleItems}
  columnDefs={columns}
  getRowId={({ data }) => data.id}
  overlayNoRowsTemplate={t.items.empty}
/>
```

❌ 錯誤

```tsx
import { AgGridReact } from 'ag-grid-react';
<AgGridReact rowData={items} columnDefs={columns} theme={themeQuartz} />; // 繞過公版:主題、文案、預設都不一致
```

要覆寫 `DataGrid` 的預設(固定高度加 `pagination`、關掉排序)可以,在呼叫端註解寫理由。

## 3. 模組與授權只在 `app/agGrid.ts`

**規則:** 模組註冊與授權只在 `src/app/agGrid.ts` 的 `registerAgGrid()`,由 `providers.tsx` 載入時呼叫一次。
元件不自己 register。Enterprise:`ModuleRegistry.registerModules([AllEnterpriseModule])` 與 `LicenseManager.setLicenseKey()`;
Community:`ModuleRegistry.registerModules([AllCommunityModule])`,沒有授權金鑰(下一段不適用)。

授權金鑰放 `.env.local` 的 `VITE_AG_GRID_LICENSE_KEY`(公司統一購買,向前端負責人索取)。它本來就會打進前端
程式,不是機密;但**不要 commit 到 repo**(`.env.local` 已被忽略)。沒有金鑰時表格帶試用水印、console 有警告,
功能不受影響,所以開發與測試不需要金鑰。

**原因:** 註冊兩次會重複載入模組;金鑰散在各處,換約時會漏改。

## 4. 欄位定義

**規則:**

- `columnDefs` 的型別寫 `ColDef<DTO>[]`,`field` 用 DTO 的欄位名(有型別檢查),`headerName` 是表頭文字(選了 i18n 時引用字典)。
- 顯示轉換用 `valueFormatter`(純文字)或 `cellRenderer`(需要元件:`Tag`、按鈕)。
- `cellRenderer` 給一個 **React 元件**(`React.FC<CustomCellRendererProps<DTO>>`),不給回傳 HTML 字串的函式;
  元件裡 `props.data` 在過濾、分群時可能是 `undefined`,先判斷再用。hook(`useTranslations`、mutation)在儲存格
  元件裡照常可用。
- 操作欄:`colId: 'actions'`、`flex: 0`、固定 `width`、`sortable: false`、`resizable: false`;寫入按鈕包 `<Can>`,
  刪除走 `useConfirmDestructive`,純圖示用 `IconButton`([components.md](./components.md) 第 8 節)。
- 列的 key:一律給 `getRowId={({ data }) => data.id}`,資料更新時 AG Grid 才能保留選取、捲動位置與展開狀態。

✅ 正確(取自 `src/components/items/ItemTable.tsx`)

```tsx
const StatusCell: React.FC<CustomCellRendererProps<Item>> = ({ data }) => {
  const t = useTranslations();

  if (!data) {
    return null;
  }
  return <Tag color={data.status === 'ACTIVE' ? 'success' : 'default'}>{t.items.status[data.status]}</Tag>;
};

const columns: ColDef<Item>[] = [
  { field: 'name', headerName: t.items.columns.name },
  { field: 'status', headerName: t.items.columns.status, cellRenderer: StatusCell, maxWidth: 160 },
];
```

❌ 錯誤

```ts
{ field: 'status', headerName: '狀態', cellRenderer: (p) => `<span class="tag">${p.value}</span>` }
// 文案寫死、HTML 字串繞過 React 與 token
```

## 5. 資料從哪裡來

**規則:** 預設 **Client-Side Row Model**:資料由 `useSuspenseQuery` 的 hook 整批給 `rowData`,排序、篩選、分頁
在前端做;`DataGrid` 外層照常包 `DataBoundary`([data-fetching.md](./data-fetching.md))。
後端做分頁 / 排序(資料量大、後端契約就是分頁 API)時改用 **Server-Side Row Model**,寫法**待補**(見第 8 節)。

**原因:** 大多數後台的清單一次回來就夠;先用最簡單的模型,契約要求時再升級。

❌ 錯誤:在 `onGridReady` 裡自己 `fetch` 或呼叫 `apiClient`(元件不呼叫 API,見 [api.md](./api.md))。

## 6. 文案與樣式

- 表頭、空資料文字(`overlayNoRowsTemplate`)、操作按鈕的 `label`:選了 i18n 時全部進字典(`i18n.md`),沒選直接寫繁中。
  AG Grid 自己的文案(篩選選單、分頁器)由 `DataGrid` 的 `localeText` 處理,不另外翻。
- 不寫 `.ag-*` 的 CSS 覆寫;顏色、圓角、字型由 `agGridTheme.ts` 的 Theming API 參數決定。prototype 的表格樣式
  `ThemeTokens` 表達不出來時,先在 `tokens.ts` 加欄位再對應([styling-theme.md](./styling-theme.md) 第 2 節)。
- 不手動 import AG Grid 的 CSS 檔(`ag-grid.css`、`ag-theme-*.css`):Theming API 會自己注入樣式,兩者並存會打架。

## 7. 測試

- 頁面測試照常 `renderApp('/路徑')`,以 `findByText` 斷言儲存格內容、以 `getByRole('button', { name })` 操作
  操作欄;不查 `.ag-row` 這類 class([testing.md](./testing.md))。
- `DataGrid` 在測試環境(`import.meta.env.MODE === 'test'`)關閉欄位虛擬化,否則 jsdom 量不到寬度、一欄都不畫;
  列虛擬化靠 `autoHeight` 不會發生。寫固定高度的表格時,測試裡看不到的列是虛擬化造成的,不是 bug。
- 排序、篩選、分群這些 AG Grid 自己的行為**不測**;只測專案的欄位定義、操作與權限。

## 8. 待補(舊專案審查後填)

- 既有專案常用的 Enterprise 功能與它們的團隊預設:分群 / 樞紐、側欄(欄位、篩選)、狀態列、範圍選取、Excel 匯出
- Server-Side Row Model 的寫法:與 `queryOptions` / `apiClient` 怎麼接、分頁參數與契約的對應
- 列選取(單選 / 多選)與批次操作的範本
- 可編輯儲存格的規則:與 `useActionMutation`、樂觀更新([ADR-0015](../adr/0015-optimistic-updates-and-races.md))的關係
- 欄位狀態(寬度、順序、排序)是否要記住、存哪裡
- 公司的授權金鑰取得流程與到期提醒
- **評估改成表格頁才載入 AG Grid**:目前 `providers.tsx` 啟動時就呼叫 `registerAgGrid()`,每一頁都下載約 2.7 MB
  (gzip 約 750 KB)的 `ag-grid` chunk。可改成在 `DataGrid` 第一次掛載時才 `import('@/app/agGrid')` 並註冊
  (或把 `DataGrid` 包成 `React.lazy`),登入頁與沒有表格的頁面就不用下載;要一併確認測試與 `DataBoundary` 的
  Suspense 行為。先看舊專案的使用者網路環境與首屏時間再決定
