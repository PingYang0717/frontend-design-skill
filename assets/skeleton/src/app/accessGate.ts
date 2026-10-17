import { httpClient } from '@/api/apiClient';
import { errorCode, httpStatus } from '@/api/apiError';
import { useAccessStore } from '@/stores/useAccessStore';

/** 存取閘門:每支 API 都會被公司後端檢查「是否在公司網路內」與「是否有這個系統的使用權限」,
 *  擋下來時前端用公司的遮罩元件整頁蓋住(docs/conventions/access.md)。
 *  登入不在這裡:沒有 cookie 時公司 SDK 自己跳轉到登入畫面,前端不判 401、不做登入頁。 */

export type AccessGateKind = 'outsideNetwork' | 'noAppPermission';

interface AccessGateRule {
  kind: AccessGateKind;
  /** 後端用哪個 HTTP 狀態碼表示;與 code 擇一或並用。 */
  status?: number;
  /** 後端用哪個 body code 表示(docs/conventions/error-handling.md 第 5 節的 ApiErrorBody.code)。 */
  code?: string;
}

/** 兩種閘門後端怎麼回,每個專案不同:收件時問,答案寫在 docs/adr/0021-access-gate.md,再改這張表。
 *  下方是骨架預設(無人值守時採用並標「暫定」)。一條規則同時寫 status 與 code 時兩者都要符合。 */
export const ACCESS_GATE_RULES: readonly AccessGateRule[] = [
  { kind: 'outsideNetwork', status: 423 },
  { kind: 'noAppPermission', status: 403 },
];

/** 這個錯誤是不是閘門擋下來的;不是就回 undefined,交給窗格錯誤卡或 toast(ADR-0006)。 */
export const resolveAccessGate = (error: unknown): AccessGateKind | undefined => {
  const status = httpStatus(error);
  const code = errorCode(error);
  if (status === undefined && code === undefined) {
    return undefined;
  }
  return ACCESS_GATE_RULES.find(
    (rule) =>
      (rule.status === undefined || rule.status === status) &&
      (rule.code === undefined || rule.code === code) &&
      (rule.status !== undefined || rule.code !== undefined)
  )?.kind;
};

let isConnected = false;

/** 把閘門接上 apiClient:任何請求被擋就寫進 useAccessStore,AccessMask 隨即整頁遮住。
 *  正式程式在 main.tsx 呼叫一次,測試在 test/setup.ts 呼叫一次;重複呼叫不會重複註冊 interceptor。
 *  錯誤仍原樣往外拋:被擋的那個窗格照常顯示錯誤卡,只是被遮罩蓋住。 */
export const connectAccessGate = () => {
  if (isConnected) {
    return;
  }
  isConnected = true;

  httpClient.interceptors.response.use(undefined, (error: unknown) => {
    const kind = resolveAccessGate(error);
    if (kind !== undefined) {
      useAccessStore.getState().block(kind);
    }
    throw error;
  });
};
