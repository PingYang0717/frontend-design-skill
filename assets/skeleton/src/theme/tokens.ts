/** 色票的唯一來源,同時餵給 antd ConfigProvider 與 CSS Modules 讀的 `--app-*` 變數。
 *
 *  新專案:從 prototype 的 CSS 變數與樣式表讀出實際值,把下方數值**逐值**換成 prototype 的值。
 *  不要靠 antd 演算法推導出「差不多」的顏色。元件與 CSS 只能用這裡有的 token。 */

/** 資料表格的 token:同時餵 antd `Table`(component token)與 AG Grid(Theming API 的 withParams,選了 ag-grid 時)。
 *  prototype 的表格樣式(列高、表頭底色、斑馬紋、hover)對到這裡;對不到的不寫 CSS 覆寫,列入待確認。 */
export interface TableTokens {
  /** 資料列高度(px)。antd Table 以 cellPaddingBlock 逼近,AG Grid 直接用。 */
  rowHeight: number;
  headerHeight: number;
  headerBg: string;
  headerFontWeight: number;
  /** 奇數列底色;與 bgContainer 相同就是沒有斑馬紋。antd Table 沒有斑馬紋,只有 AG Grid 用。 */
  stripeBg: string;
  hoverBg: string;
  /** 儲存格左右內距(px) */
  cellPaddingX: number;
  /** AG Grid 的基礎間距(px),決定表頭與儲存格的細節留白;antd Table 不用。 */
  spacing: number;
}

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
  table: TableTokens;
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
  // 預設對齊 antd Table 中等尺寸;prototype 有表格就逐值換掉。
  table: {
    rowHeight: 48,
    headerHeight: 48,
    headerBg: '#fafafa',
    headerFontWeight: 600,
    stripeBg: '#ffffff',
    hoverBg: '#f5f5f5',
    cellPaddingX: 16,
    spacing: 8,
  },
};
