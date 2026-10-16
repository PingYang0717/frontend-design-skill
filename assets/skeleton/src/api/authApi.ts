import type { LoginRequest, LoginResponse } from '@/types/api/auth';
import type { CurrentUser } from '@/types/api/user';
import { apiClient } from './apiClient';
import { apiPath } from './apiPath';

/** 身分相關端點。路徑與公司登入服務一致;換認證方式時只改這個檔案與 types/api/auth.ts(docs/conventions/login.md)。 */

/** 取得目前登入者與權限代碼;啟動時與登入後各呼叫一次。
 *  @screen 全站(RequireAuth) */
export const getCurrentUser = (): Promise<CurrentUser> => apiClient.get<CurrentUser>(apiPath('me'));

/** 帳密登入,回傳 access token。
 *  @screen 登入頁
 *  @error 401 INVALID_CREDENTIALS:帳號或密碼錯誤 → 登入頁顯示 errors.byCode 的文案,不清 session */
export const login = (body: LoginRequest): Promise<LoginResponse> =>
  apiClient.post<LoginResponse>(apiPath('auth', 'login'), body);

/** 登出;後端失敗也照樣清掉前端 session。
 *  @screen 全站(UserMenu) */
export const logout = (): Promise<void> => apiClient.post(apiPath('auth', 'logout'));
