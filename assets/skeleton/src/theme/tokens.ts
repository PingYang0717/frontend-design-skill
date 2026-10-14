/** 色票的唯一來源,同時餵給 antd ConfigProvider 與 CSS Modules 讀的 `--app-*` 變數。
 *
 *  新專案:從 prototype 的 CSS 變數與樣式表讀出實際值,把下方數值**逐值**換成
 *  prototype 的值(light 與 dark 各一組)。不要靠 antd 演算法推導出「差不多」的顏色。
 *  元件與 CSS 只能用這裡有的 token;漏掉的變數在深色模式會安靜地停在 fallback。 */

export interface ThemeTokens {
  /** 主色。antd 的 seed token,兩個主題都餵亮色值,深色由 antd 自己推導,避免被二次變暗。 */
  primary: string;
  success: string;
  warning: string;
  error: string;
  /** 頁面底色、卡片底色、浮層底色 */
  bgLayout: string;
  bgContainer: string;
  bgElevated: string;
  border: string;
  borderSecondary: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  /** 圓角、字級、字型 */
  borderRadius: number;
  fontSize: number;
  fontFamily: string;
}

const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif";

export const LIGHT_TOKENS: ThemeTokens = {
  primary: '#1677ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  bgLayout: '#f5f5f5',
  bgContainer: '#ffffff',
  bgElevated: '#ffffff',
  border: '#d9d9d9',
  borderSecondary: '#f0f0f0',
  text: 'rgba(0, 0, 0, 0.88)',
  textSecondary: 'rgba(0, 0, 0, 0.65)',
  textTertiary: 'rgba(0, 0, 0, 0.45)',
  borderRadius: 6,
  fontSize: 14,
  fontFamily: FONT_FAMILY,
};

export const DARK_TOKENS: ThemeTokens = {
  ...LIGHT_TOKENS,
  bgLayout: '#000000',
  bgContainer: '#141414',
  bgElevated: '#1f1f1f',
  border: '#424242',
  borderSecondary: '#303030',
  text: 'rgba(255, 255, 255, 0.85)',
  textSecondary: 'rgba(255, 255, 255, 0.65)',
  textTertiary: 'rgba(255, 255, 255, 0.45)',
};

export const tokensFor = (isDarkMode: boolean): ThemeTokens => (isDarkMode ? DARK_TOKENS : LIGHT_TOKENS);
