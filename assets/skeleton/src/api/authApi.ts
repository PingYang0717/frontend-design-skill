import type { CurrentUser } from '@/types/api/user';
import { apiClient } from './apiClient';

export const getCurrentUser = (): Promise<CurrentUser> => apiClient.get<CurrentUser>('/me');
