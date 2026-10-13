/** `GET /me` 的回應。欄位名稱與後端逐字一致,不在前端改名。 */
export interface CurrentUser {
  id: string;
  name: string;
  permissions: string[];
}
