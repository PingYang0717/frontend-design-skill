import { type ThemeTokens, TOKENS } from './tokens';

/** token 名稱 → CSS 變數名稱。CSS Module 一律寫 `var(--app-color-text)` 這種形式。 */
const CSS_VAR_NAMES: Record<keyof ThemeTokens, string> = {
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

const toCssValue = (key: keyof ThemeTokens, value: string | number): string =>
  typeof value === 'number' && key !== 'fontFamily' ? `${value}px` : String(value);

/** 宣告在 `:root`:對話框、下拉選單會 portal 到 body,掛在 wrapper 上的變數它們讀不到。 */
export const themeCssText = (): string => {
  const declarations = (Object.keys(CSS_VAR_NAMES) as Array<keyof ThemeTokens>)
    .map((key) => `${CSS_VAR_NAMES[key]}: ${toCssValue(key, TOKENS[key])};`)
    .join(' ');
  return `:root { ${declarations} }`;
};
