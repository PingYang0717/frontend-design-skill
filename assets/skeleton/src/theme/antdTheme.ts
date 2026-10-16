import { theme, type ThemeConfig } from 'antd';

import { TOKENS } from './tokens';

/** tokens.ts → antd ConfigProvider 的 theme。純函式,方便測試。 */
export const buildAntdTheme = (): ThemeConfig => ({
  algorithm: theme.defaultAlgorithm,
  token: {
    // seed token:hover、active 等衍生色由 algorithm 推導。
    colorPrimary: TOKENS.primary,
    colorSuccess: TOKENS.success,
    colorWarning: TOKENS.warning,
    colorError: TOKENS.error,
    // map / alias token:直接餵 prototype 的值。
    colorBgLayout: TOKENS.bgLayout,
    colorBgContainer: TOKENS.bgContainer,
    colorBgElevated: TOKENS.bgElevated,
    colorBorder: TOKENS.border,
    colorBorderSecondary: TOKENS.borderSecondary,
    colorText: TOKENS.text,
    colorTextSecondary: TOKENS.textSecondary,
    colorTextTertiary: TOKENS.textTertiary,
    borderRadius: TOKENS.borderRadius,
    fontSize: TOKENS.fontSize,
    fontFamily: TOKENS.fontFamily,
  },
  components: {
    // 表格與 tokens.table 同一組值;選了 ag-grid 時 agGridTheme.ts 也讀它,兩種表格才會長得一樣。
    // antd Table 沒有列高與斑馬紋的 token:列高以上下內距逼近(fontSize × 1.5714 是 antd 的行高),斑馬紋只有 AG Grid 有。
    Table: {
      headerBg: TOKENS.table.headerBg,
      rowHoverBg: TOKENS.table.hoverBg,
      cellPaddingInline: TOKENS.table.cellPaddingX,
      cellPaddingBlock: Math.max(0, Math.round((TOKENS.table.rowHeight - TOKENS.fontSize * 1.5714) / 2)),
    },
  },
});
