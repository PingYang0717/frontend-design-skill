import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { apiClient, httpClient } from '@/api/apiClient';
import { login } from '@/api/authApi';
import { listItems } from '@/api/itemApi';
import { useSessionStore } from '@/stores/useSessionStore';
import { TEST_ACCESS_TOKEN, testItems } from '@/test/fixtures';
import { renderApp } from '@/test/renderApp';
import { responseError } from '@/test/responseError';

vi.mock('@/api/itemApi');

const defaultAdapter = httpClient.defaults.adapter;

beforeEach(() => {
  vi.mocked(listItems).mockResolvedValue(testItems());
});

afterEach(() => {
  httpClient.defaults.adapter = defaultAdapter;
});

describe('RequireAuth', () => {
  it('sends a visitor without a session to the login page and back after signing in', async () => {
    useSessionStore.setState({ accessToken: null });
    vi.mocked(login).mockResolvedValue({ accessToken: TEST_ACCESS_TOKEN });
    const user = userEvent.setup();
    const { router } = renderApp('/items');

    await screen.findByRole('button', { name: '登入' });
    expect(router.state.location.pathname).toBe('/login');

    await user.type(screen.getByLabelText('帳號'), 'admin');
    await user.type(screen.getByLabelText('密碼'), 'admin');
    await user.click(screen.getByRole('button', { name: '登入' }));

    expect(await screen.findByText('範例項目 A')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/items');
  });

  it('clears the session and returns to the login page when the backend answers 401', async () => {
    // 401 由 app/session.ts 在 apiClient 上處理;vi.mock 的 API 函式不經過 axios,
    // 所以這裡讓清單請求真的走 apiClient,由 adapter 回 401。
    httpClient.defaults.adapter = (config) => Promise.reject(responseError(401, { code: 'UNAUTHORIZED' }, config));
    vi.mocked(listItems).mockImplementation(() => apiClient.get('/items'));
    const { router } = renderApp('/items');

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
    expect(useSessionStore.getState().accessToken).toBeNull();
  });
});
