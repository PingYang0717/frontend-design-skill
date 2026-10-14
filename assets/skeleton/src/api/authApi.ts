import type { LoginRequest, LoginResponse } from '@/types/api/auth';
import type { CurrentUser } from '@/types/api/user';
import { apiClient } from './apiClient';
import { apiPath } from './apiPath';

/** 身分相關端點。路徑與公司登入服務一致;換認證方式時只改這個檔案與 types/api/auth.ts(docs/conventions/login.md)。 */

export const getCurrentUser = (): Promise<CurrentUser> => apiClient.get<CurrentUser>(apiPath('me'));

export const login = (body: LoginRequest): Promise<LoginResponse> =>
  apiClient.post<LoginResponse>(apiPath('auth', 'login'), body);

export const logout = (): Promise<void> => apiClient.post(apiPath('auth', 'logout'));
