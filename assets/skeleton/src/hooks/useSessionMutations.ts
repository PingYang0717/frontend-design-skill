import { useQueryClient } from '@tanstack/react-query';

import { login, logout } from '@/api/authApi';
import { useSessionStore } from '@/stores/useSessionStore';
import { useActionMutation } from './useActionMutation';

export const useLogin = () => {
  const setAccessToken = useSessionStore((state) => state.setAccessToken);

  return useActionMutation({
    mutationFn: login,
    onSuccess: ({ accessToken }) => setAccessToken(accessToken),
    // 登入失敗的文案顯示在登入表單內的 Alert(LoginPage 讀 mutation.error),不用 toast。
    onError: () => {},
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const clearSession = useSessionStore((state) => state.clearSession);

  return useActionMutation({
    mutationFn: logout,
    // 後端的登出失敗也視為已登出:使用者按了登出就不該再看到畫面,所以不用 toast。
    onError: () => {},
    onSettled: () => {
      clearSession();
      // 丟掉目前使用者等快取,下一個登入的人不會看到上一個人的資料。
      queryClient.clear();
    },
  });
};
