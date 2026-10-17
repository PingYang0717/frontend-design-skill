import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

import { getPermissions } from '@/api/permissionApi';
import type { Permission } from '@/constants/permissions';

export const permissionsQueryKey = ['permissions'] as const;

export const permissionsQuery = queryOptions({
  queryKey: permissionsQueryKey,
  queryFn: getPermissions,
  // 權限在一次瀏覽中幾乎不變,不必每次回到視窗就重抓;需要即時生效時調整這裡(ADR-0012)。
  staleTime: 5 * 60 * 1000,
});

/** 目前使用者的權限代碼清單(伺服器資料,只走 TanStack Query)。元件不直接用它判斷,走下面兩個 hook。 */
export const usePermissions = () => useSuspenseQuery(permissionsQuery).data;

/** 目前使用者是否擁有某個權限。`undefined` 代表不需要權限,一律為 true。 */
export const usePermission = (permission: Permission | undefined): boolean => {
  const permissions = usePermissions();
  return permission === undefined || permissions.includes(permission);
};

/** 一次判斷多個權限,回傳可用來過濾清單的函式(例如選單);hook 不能在 .filter 裡呼叫,所以要有這個。 */
export const usePermissionChecker = (): ((permission: Permission | undefined) => boolean) => {
  const permissions = usePermissions();
  return (permission) => permission === undefined || permissions.includes(permission);
};
