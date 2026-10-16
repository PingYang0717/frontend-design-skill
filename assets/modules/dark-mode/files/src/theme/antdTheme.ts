import { theme, type ThemeConfig } from 'antd';

import { LIGHT_TOKENS, tokensFor } from './tokens';

/** tokens.ts → antd ConfigProvider 的 theme。純函式,方便測試。 */
export const buildAntdTheme = (isDarkMode: boolean): ThemeConfig => {
  const tokens = tokensFor(isDarkMode);
  return {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      // seed token:兩個主題都餵亮色值,由 algorithm 推導深色。
      colorPrimary: LIGHT_TOKENS.primary,
      colorSuccess: LIGHT_TOKENS.success,
      colorWarning: LIGHT_TOKENS.warning,
      colorError: LIGHT_TOKENS.error,
      // map / alias token:直接餵當前主題的值。
      colorBgLayout: tokens.bgLayout,
      colorBgContainer: tokens.bgContainer,
      colorBgElevated: tokens.bgElevated,
      colorBorder: tokens.border,
      colorBorderSecondary: tokens.borderSecondary,
      colorText: tokens.text,
      colorTextSecondary: tokens.textSecondary,
      colorTextTertiary: tokens.textTertiary,
      borderRadius: tokens.borderRadius,
      fontSize: tokens.fontSize,
      fontFamily: tokens.fontFamily,
    },
    components: {
      // 表格與 tokens.table 同一組值;選了 ag-grid 時 agGridTheme.ts 也讀它,兩種表格才會長得一樣。
      // antd Table 沒有列高與斑馬紋的 token:列高以上下內距逼近(fontSize × 1.5714 是 antd 的行高),斑馬紋只有 AG Grid 有。
      Table: {
        headerBg: tokens.table.headerBg,
        rowHoverBg: tokens.table.hoverBg,
        cellPaddingInline: tokens.table.cellPaddingX,
        cellPaddingBlock: Math.max(0, Math.round((tokens.table.rowHeight - tokens.fontSize * 1.5714) / 2)),
      },
    },
  };
};
