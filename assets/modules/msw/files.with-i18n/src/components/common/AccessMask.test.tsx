import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen } from '@testing-library/react';

import { resolveAccessGate } from '@/app/accessGate';
import { zhTW as t } from '@/i18n/zhTW';
import { server } from '@/mocks/server';
import { useAccessStore } from '@/stores/useAccessStore';
import { renderApp } from '@/test/renderApp';
import { responseError } from '@/test/responseError';

/** 存取閘門範本:任何 API 回閘門的狀態碼,整頁就被公司的遮罩蓋住(測試裡是 companyUiStub)。
 *  有 MSW 時請求真的經過 axios 與 interceptor,所以直接用 server.use 讓端點回閘門的狀態碼。
 *  狀態碼依 app/accessGate.ts 的 ACCESS_GATE_RULES;專案改了表,這支測試的數字跟著改。 */
describe('AccessMask', () => {
  it('stays hidden while every request is allowed', async () => {
    renderApp('/items');

    expect(await screen.findByText('範例項目 A')).toBeInTheDocument();
    expect(screen.queryByTestId('access-blocked')).not.toBeInTheDocument();
  });

  it('covers the whole page when the backend blocks a request outside the company network', async () => {
    server.use(http.get('*/api/items', () => new HttpResponse(null, { status: 423 })));
    renderApp('/items');

    expect(await screen.findByTestId('access-blocked')).toHaveAttribute('data-kind', 'outsideNetwork');
    expect(useAccessStore.getState().blocked).toBe('outsideNetwork');
  });

  it('leaves ordinary errors to the panel', async () => {
    server.use(http.get('*/api/items', () => HttpResponse.json({ code: 'BOOM' }, { status: 500 })));
    renderApp('/items');

    expect(await screen.findByText(t.errors.loadFailed(t.items.entity))).toBeInTheDocument();
    expect(screen.queryByTestId('access-blocked')).not.toBeInTheDocument();
  });

  it('maps the configured status codes to gate kinds', () => {
    expect(resolveAccessGate(responseError(423, {}))).toBe('outsideNetwork');
    expect(resolveAccessGate(responseError(403, {}))).toBe('noAppPermission');
    expect(resolveAccessGate(responseError(500, {}))).toBeUndefined();
  });
});
