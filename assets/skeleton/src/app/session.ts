import { httpClient, setAuthHeaderProvider } from '@/api/apiClient';
import { httpStatus } from '@/api/apiError';
import { useSessionStore } from '@/stores/useSessionStore';

let isConnected = false;

/** 把 session store 接上 apiClient:每個請求帶 `Authorization: Bearer <token>`;
 *  後端回 401 就清掉 session,`RequireAuth` 會把使用者送回登入頁。
 *  正式程式在 main.tsx 呼叫一次,測試在 test/setup.ts 呼叫一次;重複呼叫不會重複註冊 interceptor。 */
export const connectSession = () => {
  if (isConnected) {
    return;
  }
  isConnected = true;

  setAuthHeaderProvider((): Record<string, string> => {
    const { accessToken } = useSessionStore.getState();
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  });

  httpClient.interceptors.response.use(undefined, (error: unknown) => {
    if (httpStatus(error) === 401) {
      useSessionStore.getState().clearSession();
    }
    throw error;
  });
};
