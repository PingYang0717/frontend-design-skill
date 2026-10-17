import React, { type ReactNode } from 'react';
import { Navigate } from 'react-router';

import type { Permission } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { usePermission } from '@/hooks/usePermission';

interface RequirePermissionProps {
  permission: Permission | undefined;
  children: ReactNode;
  /** 沒有權限時怎麼辦:`hide`(預設)什麼都不顯示或顯示 fallback——按鈕、欄位、區塊用;
   *  `redirect` 導到 403 頁——路由層用(app/routes.tsx)。 */
  onDenied?: 'hide' | 'redirect';
  /** `hide` 時沒有權限顯示的內容(例如唯讀文字);預設什麼都不顯示。 */
  fallback?: ReactNode;
}

/** 權限守衛,路由與元件共用同一個:路由層 `onDenied="redirect"`,元件層預設 `hide`。
 *  前端守衛只是體驗,真正的檢查一定在後端(docs/conventions/permissions.md 第 0 節)。 */
const RequirePermission: React.FC<RequirePermissionProps> = ({
  permission,
  children,
  onDenied = 'hide',
  fallback = null,
}) => {
  const allowed = usePermission(permission);

  if (allowed) {
    return children;
  }
  return onDenied === 'redirect' ? <Navigate to={ROUTES.forbidden} replace /> : fallback;
};

export default RequirePermission;
