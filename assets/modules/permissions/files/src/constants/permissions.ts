/** 權限代碼的唯一來源,值與後端回傳的字串逐字一致(docs/conventions/permissions.md)。
 *  新增權限:在這裡加一列 → 選單項目或路由設定 `permission` → 按鈕用 `<RequirePermission>` 包住。 */
export const PERMISSIONS = {
  itemsRead: 'items:read',
  itemsWrite: 'items:write',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
