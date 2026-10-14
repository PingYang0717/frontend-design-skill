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
});
