import React, { type ReactNode } from 'react';
import { Navigate } from 'react-router';

import type { Permission } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { usePermission } from '@/hooks/usePermission';

interface RequirePermissionProps {
  permission: Permission | undefined;
  children: ReactNode;
}

/** 路由守衛:沒有權限就導到 403 頁。前端守衛只是體驗,真正的檢查一定在後端。 */
const RequirePermission: React.FC<RequirePermissionProps> = ({ permission, children }) => {
  const allowed = usePermission(permission);

  return allowed ? children : <Navigate to={ROUTES.forbidden} replace />;
};

export default RequirePermission;
