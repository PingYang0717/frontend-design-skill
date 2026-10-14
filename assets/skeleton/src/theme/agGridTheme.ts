import { colorSchemeDark, colorSchemeLight, themeQuartz } from 'ag-grid-community';

import { LIGHT_TOKENS, tokensFor } from './tokens';

/** tokens.ts → AG Grid Theming API 的 theme。與 antdTheme.ts 同一張表推導,表格與其他元件的顏色才會一致。
 *  只對應 ThemeTokens 已有的欄位;prototype 對表格有額外要求(列高、斑馬紋)時先在 tokens.ts 加欄位再對應。 */
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
  });
};
