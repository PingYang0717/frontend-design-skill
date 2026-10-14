import React, { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { ROUTES } from '@/constants/routes';
import { selectIsAuthenticated, useSessionStore } from '@/stores/useSessionStore';

interface RequireAuthProps {
  children: ReactNode;
}

/** 登入守衛:沒有 session 就導到登入頁,並記住原本要去的網址,登入後回到那裡。
 *  前端守衛只是體驗,真正的檢查在後端(401 由 app/session.ts 處理)。 */
const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const isAuthenticated = useSessionStore(selectIsAuthenticated);
  const location = useLocation();

  if (isAuthenticated) {
    return children;
  }
  return <Navigate to={ROUTES.login} state={{ from: `${location.pathname}${location.search}` }} replace />;
};

export default RequireAuth;
