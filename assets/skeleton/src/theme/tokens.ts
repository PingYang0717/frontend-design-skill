/** 色票的唯一來源,同時餵給 antd ConfigProvider 與 CSS Modules 讀的 `--app-*` 變數。
 *
 *  新專案:從 prototype 的 CSS 變數與樣式表讀出實際值,把下方數值**逐值**換成 prototype 的值。
 *  不要靠 antd 演算法推導出「差不多」的顏色。元件與 CSS 只能用這裡有的 token。 */

export interface ThemeTokens {
  /** 主色。antd 的 seed token,hover、active 等衍生色由 antd 推導。 */
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

export const TOKENS: ThemeTokens = {
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
