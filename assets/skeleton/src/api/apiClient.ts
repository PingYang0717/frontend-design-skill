import axios, { type AxiosRequestConfig } from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

/** 原始 axios instance。只在需要操作 axios 本身時使用(註冊 interceptor、測試換 adapter)。
 *  身分靠公司登入 SDK 放在 cookie 裡,瀏覽器自動帶;前端不組 Authorization header、不保管 token
 *  (docs/conventions/access.md)。withCredentials 讓跨網域的 API 也帶 cookie。 */
export const httpClient = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

// 拆掉 res.data,呼叫端直接拿到 DTO。錯誤原樣往外拋,判讀交給 apiError.ts;閘門由 app/accessGate.ts 的 interceptor 接。
httpClient.interceptors.response.use((response) => response.data);

/** 型別正確的包裝:`apiClient.get<Item[]>('/items')` 直接回 `Promise<Item[]>`。 */
export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) => httpClient.get<T, T>(url, config),
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => httpClient.post<T, T>(url, body, config),
  put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => httpClient.put<T, T>(url, body, config),
  patch: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => httpClient.patch<T, T>(url, body, config),
  delete: <T = void>(url: string, config?: AxiosRequestConfig) => httpClient.delete<T, T>(url, config),
};
