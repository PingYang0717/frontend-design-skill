import React, { type ReactNode } from 'react';

import type { Permission } from '@/constants/permissions';
import { usePermission } from '@/hooks/usePermission';

interface CanProps {
  permission: Permission;
  children: ReactNode;
  /** 沒有權限時顯示的內容;預設什麼都不顯示。 */
  fallback?: ReactNode;
}

/** 元件層級權限:按鈕、欄位、區塊用它包住。不要在元件裡自己讀 user.permissions。 */
const Can: React.FC<CanProps> = ({ permission, children, fallback = null }) => {
  const allowed = usePermission(permission);

  return allowed ? children : fallback;
};

export default Can;
