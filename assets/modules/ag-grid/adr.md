# 0018. 資料表格一律用 AG Grid,透過公版 `DataGrid`

## 背景

公司內部系統的表格是使用者每天停留最久的地方:排序、篩選、多選、分群、匯出 Excel 這些需求在每個專案都會出現。
公司已統一採購 AG Grid Enterprise,既有專案也都用它;antd 的 `Table` 做得到基本排序與分頁,但分群、側欄、
範圍選取、Server-Side Row Model 做不到,團隊也不想在兩套表格之間切換。

AG Grid 本身有很多進入點:元件可以各自 `registerModules`、各自挑主題、各自翻文案。放任不管,三個畫面會長出
三種表格。

## 決策

**1. 資料表格只用 AG Grid(Enterprise 或 Community,記在 ADR-0022 的細項);antd `Table` 不用。** 幾列、無互動的屬性表用 antd `Descriptions`。

**2. 元件透過 `components/common/DataGrid` 使用,不直接 import `AgGridReact`。** `DataGrid` 集中主題
(`theme/agGridTheme.ts`,由 `tokens.ts` 推導,與 antd 同一張色票)、內建文案(跟著介面語言)、版面與欄位預設。

**3. 模組註冊與授權金鑰只在 `app/agGrid.ts`。** `registerAgGrid()` 由 `providers.tsx` 呼叫一次;金鑰來自
`VITE_AG_GRID_LICENSE_KEY`,沒有金鑰時只是帶水印,開發與測試不需要金鑰。

**4. 預設 Client-Side Row Model。** 資料由 `useSuspenseQuery` 的 hook 整批給 `rowData`,外層照常包
`DataBoundary`([ADR-0005](0005-suspense-query-and-data-boundary.md));後端分頁時才升級 Server-Side Row Model。

**5. 儲存格用 React 元件,不用 HTML 字串。** `cellRenderer` 給 `React.FC<CustomCellRendererProps<DTO>>`,
文案規則與表格外相同(選了 i18n 時進字典)、顏色走 token、權限用 `<RequirePermission>`(選了 permissions 模組時)——表格裡的規則與表格外一樣。

✅

```tsx
<DataGrid<Item> rowData={items} columnDefs={columns} getRowId={({ data }) => data.id} />
```

❌

```tsx
<Table<Item> rowKey="id" columns={columns} dataSource={items} />  // antd Table
<AgGridReact rowData={items} columnDefs={columns} />              // 繞過 DataGrid
```

規則細節見 [`ag-grid.md`](../conventions/ag-grid.md)。

## 後果

- 所有系統的表格行為一致;升級 AG Grid、換主題、換授權只改 `DataGrid`、`agGridTheme.ts`、`app/agGrid.ts`。
- bundle 多一個約 750 KB(gzip)的 `ag-grid` chunk,獨立快取,只在升級時失效(`vite.config.ts` 的
  `codeSplitting.groups`)。
- 測試環境關閉欄位虛擬化(jsdom 量不到寬度);列虛擬化靠 `autoHeight` 迴避。固定高度的表格在測試裡只看得到
  可視範圍的列。
- 這份決策目前只固定「用什麼、從哪裡用」;Enterprise 功能的團隊預設與 Server-Side Row Model 的寫法待舊專案
  審查後補進 `ag-grid.md`。

### 何時重新討論

- 授權到期不再續約:改疊模組的 `files.community/`(`app/agGrid.ts` 改註冊 `AllCommunityModule`)、拿掉 `ag-grid-enterprise`,
  盤點用到 Enterprise 功能的畫面,並新增 ADR 取代 0022。
- 出現大量非表格型的清單(卡片牆、時間軸)時,另訂清單元件的規範,不往 `DataGrid` 塞。
