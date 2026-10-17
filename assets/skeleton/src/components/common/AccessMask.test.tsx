import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';

import { httpClient } from '@/api/apiClient';
import { listItems } from '@/api/itemApi';
import { resolveAccessGate } from '@/app/accessGate';
import { useAccessStore } from '@/stores/useAccessStore';
import { testItems } from '@/test/fixtures';
import { renderApp } from '@/test/renderApp';
import { responseError } from '@/test/responseError';

vi.mock('@/api/itemApi');

/** 存取閘門範本:任何 API 回閘門的狀態碼,整頁就被公司的遮罩蓋住(測試裡是 companyUiStub)。
 *  狀態碼依 app/accessGate.ts 的 ACCESS_GATE_RULES;專案改了表,這支測試的數字跟著改。 */
describe('AccessMask', () => {
  beforeEach(() => {
    vi.mocked(listItems).mockResolvedValue(testItems());
  });

  it('stays hidden while every request is allowed', async () => {
    renderApp('/items');

    expect(await screen.findByText('範例項目 A')).toBeInTheDocument();
    expect(screen.queryByTestId('access-blocked')).not.toBeInTheDocument();
  });

  it('covers the whole page once the store says the user is blocked', async () => {
    renderApp('/items');
    await screen.findByText('範例項目 A');

    useAccessStore.getState().block('noAppPermission');

    expect(await screen.findByTestId('access-blocked')).toHaveAttribute('data-kind', 'noAppPermission');
  });

  it('maps the configured status codes to gate kinds', () => {
    expect(resolveAccessGate(responseError(423, {}))).toBe('outsideNetwork');
    expect(resolveAccessGate(responseError(403, {}))).toBe('noAppPermission');
    expect(resolveAccessGate(responseError(500, {}))).toBeUndefined();
    expect(resolveAccessGate(new Error('boom'))).toBeUndefined();
  });
});

/** interceptor 本身:讓 axios 的 adapter 直接回閘門的錯誤,確認 store 被寫入、錯誤仍往外拋。 */
describe('connectAccessGate', () => {
  const originalAdapter = httpClient.defaults.adapter;

  afterEach(() => {
    httpClient.defaults.adapter = originalAdapter;
  });

  it('blocks the app when the backend answers with a gate status', async () => {
    httpClient.defaults.adapter = () => Promise.reject(responseError(423, {}));

    await expect(httpClient.get('/anything')).rejects.toBeDefined();
    expect(useAccessStore.getState().blocked).toBe('outsideNetwork');
  });

  it('leaves the store alone for ordinary errors', async () => {
    httpClient.defaults.adapter = () => Promise.reject(responseError(500, { code: 'BOOM' }));

    await expect(httpClient.get('/anything')).rejects.toBeDefined();
    expect(useAccessStore.getState().blocked).toBeNull();
  });
});
