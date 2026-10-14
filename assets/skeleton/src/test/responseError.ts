import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';

/** 造一個「後端有回應」的 AxiosError,形狀與 apiClient 實際拋出的相同,給 apiError 判讀。 */
export const responseError = (
  status: number,
  data: unknown,
  config: InternalAxiosRequestConfig = { headers: new AxiosHeaders() }
) =>
  new AxiosError('Request failed', status >= 500 ? 'ERR_BAD_RESPONSE' : 'ERR_BAD_REQUEST', config, undefined, {
    status,
    statusText: '',
    data,
    headers: {},
    config,
  });
