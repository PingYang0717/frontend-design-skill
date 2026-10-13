import type { Permission } from '@/constants/permissions';
import { useCurrentUser } from './useCurrentUser';

/** 目前使用者是否擁有某個權限。`undefined` 代表不需要權限,一律為 true。 */
export const usePermission = (permission: Permission | undefined): boolean => {
  const user = useCurrentUser();
  return permission === undefined || user.permissions.includes(permission);
};

/** 一次判斷多個權限,回傳可用來過濾清單的函式(例如選單)。 */
export const usePermissionChecker = (): ((permission: Permission | undefined) => boolean) => {
  const user = useCurrentUser();
  return (permission) => permission === undefined || user.permissions.includes(permission);
};
