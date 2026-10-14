import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { SESSION_STORAGE_KEY } from '@/constants/storage';

/** 登入狀態(access token)。它是 client 端的 session 狀態,不是伺服器資料,所以放 store 而不是 TanStack Query;
 *  使用者資料(姓名、權限)仍走 `useCurrentUser`。
 *  token 怎麼送出、401 怎麼處理在 `app/session.ts`;這裡只存值(docs/conventions/login.md)。 */
interface SessionState {
  accessToken: string | null;
  setAccessToken: (accessToken: string) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  devtools(
    persist(
      (set) => ({
        accessToken: null,
        setAccessToken: (accessToken) => set({ accessToken }, false, 'setAccessToken'),
        clearSession: () => set({ accessToken: null }, false, 'clearSession'),
      }),
      { name: SESSION_STORAGE_KEY }
    ),
    { name: 'Session' }
  )
);

export const selectIsAuthenticated = (state: SessionState): boolean => state.accessToken !== null;
