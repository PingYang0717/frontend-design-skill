import { colorSchemeLight, themeQuartz } from 'ag-grid-community';

import { TOKENS } from './tokens';

/** tokens.ts → AG Grid Theming API 的 theme。與 antdTheme.ts 同一張表推導,表格與其他元件的顏色才會一致。
 *  表格專屬的樣式(列高、表頭、斑馬紋、hover、內距)來自 tokens.table;prototype 的表格樣式對不到這些參數時,
 *  先在 tokens.ts 的 TableTokens 加欄位、這裡加對應,再使用——不寫 .ag-* 的 CSS 覆寫(docs/conventions/ag-grid.md 第 6 節)。 */
const AG_GRID_THEME = themeQuartz.withPart(colorSchemeLight).withParams({
  accentColor: TOKENS.primary,
  backgroundColor: TOKENS.bgContainer,
  chromeBackgroundColor: TOKENS.bgLayout,
  foregroundColor: TOKENS.text,
  headerTextColor: TOKENS.textSecondary,
  borderColor: TOKENS.borderSecondary,
  borderRadius: TOKENS.borderRadius,
  wrapperBorderRadius: TOKENS.borderRadius,
  fontFamily: TOKENS.fontFamily,
  fontSize: TOKENS.fontSize,
  browserColorScheme: 'light',
  // 表格專屬:與 antd Table 的 component token 同一組值(antdTheme.ts)。
  rowHeight: TOKENS.table.rowHeight,
  headerHeight: TOKENS.table.headerHeight,
  headerBackgroundColor: TOKENS.table.headerBg,
  headerFontWeight: TOKENS.table.headerFontWeight,
  oddRowBackgroundColor: TOKENS.table.stripeBg,
  rowHoverColor: TOKENS.table.hoverBg,
  cellHorizontalPadding: TOKENS.table.cellPaddingX,
  spacing: TOKENS.table.spacing,
});

/** DataGrid 用的主題。專案沒有深色模式,主題固定;寫成 hook 是為了與深色模式版本同一個介面,DataGrid 不必分兩版。 */
export const useAgGridTheme = () => AG_GRID_THEME;
