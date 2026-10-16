import { colorSchemeDark, colorSchemeLight, themeQuartz } from 'ag-grid-community';

import { useThemeStore } from '@/stores/useThemeStore';
import { LIGHT_TOKENS, tokensFor } from './tokens';

/** tokens.ts → AG Grid Theming API 的 theme。與 antdTheme.ts 同一張表推導,表格與其他元件的顏色才會一致。
 *  表格專屬的樣式(列高、表頭、斑馬紋、hover、內距)來自 tokens.table,跟著淺色 / 深色切換;prototype 的表格樣式
 *  對不到這些參數時,先在 tokens.ts 的 TableTokens 加欄位、這裡加對應,再使用——不寫 .ag-* 的 CSS 覆寫
 *  (docs/conventions/ag-grid.md 第 6 節)。 */
export const buildAgGridTheme = (isDarkMode: boolean) => {
  const tokens = tokensFor(isDarkMode);
  return themeQuartz.withPart(isDarkMode ? colorSchemeDark : colorSchemeLight).withParams({
    // 主色與 antd 的 seed token 同一個值,兩個主題都餵亮色。
    accentColor: LIGHT_TOKENS.primary,
    backgroundColor: tokens.bgContainer,
    chromeBackgroundColor: tokens.bgLayout,
    foregroundColor: tokens.text,
    headerTextColor: tokens.textSecondary,
    borderColor: tokens.borderSecondary,
    borderRadius: tokens.borderRadius,
    wrapperBorderRadius: tokens.borderRadius,
    fontFamily: tokens.fontFamily,
    fontSize: tokens.fontSize,
    browserColorScheme: isDarkMode ? 'dark' : 'light',
    // 表格專屬:與 antd Table 的 component token 同一組值(antdTheme.ts)。
    rowHeight: tokens.table.rowHeight,
    headerHeight: tokens.table.headerHeight,
    headerBackgroundColor: tokens.table.headerBg,
    headerFontWeight: tokens.table.headerFontWeight,
    oddRowBackgroundColor: tokens.table.stripeBg,
    rowHoverColor: tokens.table.hoverBg,
    cellHorizontalPadding: tokens.table.cellPaddingX,
    spacing: tokens.table.spacing,
  });
};

/** DataGrid 用的主題:跟著淺色 / 深色切換。 */
export const useAgGridTheme = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  return buildAgGridTheme(isDarkMode);
};
