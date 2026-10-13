import axios, { type AxiosRequestConfig } from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

type HeaderProvider = () => Record<string, string>;

let authHeaderProvider: HeaderProvider = () => ({});

/** 換掉認證 header 的來源(例如登入後帶 token)。provider 每次請求都會被呼叫,不要快取回傳值。 */
export const setAuthHeaderProvider = (provider: HeaderProvider) => {
  authHeaderProvider = provider;
};

/** 每個請求要帶的認證 header。不走 axios 的請求(fetch、串流)也要用它,確保身分只有一個來源。 */
export const getAuthHeaders = (): Record<string, string> => authHeaderProvider();

/** 原始 axios instance。只在需要操作 axios 本身時使用(註冊 interceptor、測試換 adapter)。 */
export const httpClient = axios.create({ baseURL: API_BASE_URL });

httpClient.interceptors.request.use((config) => {
  for (const [name, value] of Object.entries(getAuthHeaders())) {
    config.headers.set(name, value);
  }
  return config;
});

// 拆掉 res.data,呼叫端直接拿到 DTO。錯誤原樣往外拋,判讀交給 apiError.ts。
httpClient.interceptors.response.use((response) => response.data);

/** 型別正確的包裝:`apiClient.get<Item[]>('/items')` 直接回 `Promise<Item[]>`。 */
export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) => httpClient.get<T, T>(url, config),
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => httpClient.post<T, T>(url, body, config),
  put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => httpClient.put<T, T>(url, body, config),
  patch: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => httpClient.patch<T, T>(url, body, config),
  delete: <T = void>(url: string, config?: AxiosRequestConfig) => httpClient.delete<T, T>(url, config),
};
