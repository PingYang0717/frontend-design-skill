/** 組 API 路徑並逐段編碼,id 裡的 `/`、`?` 不會改變路徑結構。
 *  `apiPath('items', id)` → `/items/abc%2F1` */
export const apiPath = (...segments: Array<string | number>): string =>
  `/${segments.map((segment) => encodeURIComponent(String(segment))).join('/')}`;
