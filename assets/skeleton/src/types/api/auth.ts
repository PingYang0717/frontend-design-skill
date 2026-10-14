/** 登入服務的 DTO。欄位名稱與公司登入服務逐字一致;認證方式不同的專案只改這裡、`api/authApi.ts`
 *  與 `mocks/handlers.ts`,其餘登入流程(store、守衛、登入頁)不動(docs/conventions/login.md)。 */
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}
