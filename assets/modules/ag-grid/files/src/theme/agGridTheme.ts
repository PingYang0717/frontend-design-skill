import { colorSchemeLight, themeQuartz } from 'ag-grid-community';

import { TOKENS } from './tokens';

/** tokens.ts → AG Grid Theming API 的 theme。與 antdTheme.ts 同一張表推導,表格與其他元件的顏色才會一致。
 *  只對應 ThemeTokens 已有的欄位;prototype 對表格有額外要求(列高、斑馬紋)時先在 tokens.ts 加欄位再對應。 */
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
});

/** DataGrid 用的主題。專案沒有深色模式,主題固定;寫成 hook 是為了與深色模式版本同一個介面,DataGrid 不必分兩版。 */
export const useAgGridTheme = () => AG_GRID_THEME;
