import { type TableTokens, type ThemeTokens, tokensFor } from './tokens';

type FlatTokenKey = Exclude<keyof ThemeTokens, 'table'>;

/** token 名稱 → CSS 變數名稱。CSS Module 一律寫 `var(--app-color-text)` 這種形式。 */
const CSS_VAR_NAMES: Record<FlatTokenKey, string> = {
  primary: '--app-color-primary',
  success: '--app-color-success',
  warning: '--app-color-warning',
  error: '--app-color-error',
  bgLayout: '--app-color-bg-layout',
  bgContainer: '--app-color-bg-container',
  bgElevated: '--app-color-bg-elevated',
  border: '--app-color-border',
  borderSecondary: '--app-color-border-secondary',
  text: '--app-color-text',
  textSecondary: '--app-color-text-secondary',
  textTertiary: '--app-color-text-tertiary',
  borderRadius: '--app-radius',
  fontSize: '--app-font-size',
  fontFamily: '--app-font-family',
};

/** 表格 token 的 CSS 變數;自製的清單、摘要表要跟資料表格對齊時用。 */
const TABLE_CSS_VAR_NAMES: Record<keyof TableTokens, string> = {
  rowHeight: '--app-table-row-height',
  headerHeight: '--app-table-header-height',
  headerBg: '--app-table-header-bg',
  headerFontWeight: '--app-table-header-font-weight',
  stripeBg: '--app-table-stripe-bg',
  hoverBg: '--app-table-hover-bg',
  cellPaddingX: '--app-table-cell-padding-x',
  spacing: '--app-table-spacing',
};

/** 數值除了字型與字重都加 px。 */
const UNITLESS = new Set<string>(['fontFamily', 'headerFontWeight']);

const toCssValue = (key: string, value: string | number): string =>
  typeof value === 'number' && !UNITLESS.has(key) ? `${value}px` : String(value);

/** 宣告在 `:root`:對話框、下拉選單會 portal 到 body,掛在 wrapper 上的變數它們讀不到。 */
export const themeCssText = (isDarkMode: boolean): string => {
  const tokens = tokensFor(isDarkMode);
  const declarations = [
    ...(Object.keys(CSS_VAR_NAMES) as FlatTokenKey[]).map(
      (key) => `${CSS_VAR_NAMES[key]}: ${toCssValue(key, tokens[key])};`
    ),
    ...(Object.keys(TABLE_CSS_VAR_NAMES) as Array<keyof TableTokens>).map(
      (key) => `${TABLE_CSS_VAR_NAMES[key]}: ${toCssValue(key, tokens.table[key])};`
    ),
  ].join(' ');
  return `:root { ${declarations} }`;
};
