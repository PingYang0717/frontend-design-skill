import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { login } from '@/api/authApi';
import { useSessionStore } from '@/stores/useSessionStore';
import { TEST_USER } from '@/test/fixtures';
import { renderApp } from '@/test/renderApp';
import { responseError } from '@/test/responseError';

describe('Login page', () => {
  it('shows the backend error when the credentials are wrong', async () => {
    useSessionStore.setState({ accessToken: null });
    vi.mocked(login).mockRejectedValue(responseError(401, { code: 'INVALID_CREDENTIALS' }));
    const user = userEvent.setup();
    const { router } = renderApp('/login');

    await user.type(await screen.findByLabelText('帳號'), 'admin');
    await user.type(screen.getByLabelText('密碼'), 'wrong');
    await user.click(screen.getByRole('button', { name: '登入' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('帳號或密碼不正確。');
    expect(vi.mocked(login)).toHaveBeenCalledWith({ username: 'admin', password: 'wrong' }, expect.anything());
    expect(router.state.location.pathname).toBe('/login');
    expect(useSessionStore.getState().accessToken).toBeNull();
  });

  it('asks for both fields before submitting', async () => {
    useSessionStore.setState({ accessToken: null });
    const user = userEvent.setup();
    renderApp('/login');

    await user.click(await screen.findByRole('button', { name: '登入' }));

    expect(await screen.findByText('請輸入帳號')).toBeInTheDocument();
    expect(screen.getByText('請輸入密碼')).toBeInTheDocument();
    expect(vi.mocked(login)).not.toHaveBeenCalled();
  });

  it('sends an already signed-in user to the home page', async () => {
    const { router } = renderApp('/login');

    expect(await screen.findByText(`歡迎回來,${TEST_USER.name}`)).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
  });
});
