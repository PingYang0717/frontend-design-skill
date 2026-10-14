import { AgGridReact, type AgGridReactProps } from 'ag-grid-react';
import { AG_GRID_LOCALE_TW } from '@ag-grid-community/locale';

import { useAgGridTheme } from '@/theme/agGridTheme';

type DataGridProps<TData> = AgGridReactProps<TData>;

/** 資料表格一律用它(AG Grid 的公版包裝):主題跟 tokens.ts、內建文案用繁體中文、團隊預設的欄位行為。
 *  呼叫端只給 rowData、columnDefs 與 getRowId;要覆寫這裡的預設時在呼叫端註解理由(docs/conventions/ag-grid.md)。
 *  泛型元件無法寫成 React.FC<Props>,是 components.md 第 2 節允許的例外。 */
const DataGrid = <TData,>({ defaultColDef, ...gridProps }: DataGridProps<TData>) => {
  const theme = useAgGridTheme();

  return (
    <AgGridReact<TData>
      theme={theme}
      localeText={AG_GRID_LOCALE_TW}
      // 表格高度跟著資料長,外層卡片自然捲動;資料量大到需要固定高度時由呼叫端覆寫並加 pagination。
      domLayout="autoHeight"
      defaultColDef={{ flex: 1, minWidth: 120, sortable: true, resizable: true, ...defaultColDef }}
      // jsdom 量不到寬度,欄位虛擬化會一欄都不畫;只在測試環境關掉,正式環境維持虛擬化。
      suppressColumnVirtualisation={import.meta.env.MODE === 'test'}
      {...gridProps}
    />
  );
};

export default DataGrid;
