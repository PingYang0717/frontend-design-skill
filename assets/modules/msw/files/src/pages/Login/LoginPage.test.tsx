import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { db, MOCK_LOGIN } from '@/mocks/db';
import { useSessionStore } from '@/stores/useSessionStore';
import { renderApp } from '@/test/renderApp';

describe('Login page', () => {
  it('shows the backend error when the credentials are wrong', async () => {
    useSessionStore.setState({ accessToken: null });
    const user = userEvent.setup();
    const { router } = renderApp('/login');

    await user.type(await screen.findByLabelText('帳號'), MOCK_LOGIN.username);
    await user.type(screen.getByLabelText('密碼'), 'wrong');
    await user.click(screen.getByRole('button', { name: '登入' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('帳號或密碼不正確。');
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
  });

  it('sends an already signed-in user to the home page', async () => {
    const { router } = renderApp('/login');

    expect(await screen.findByText(`歡迎回來,${db.currentUser.name}`)).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
  });
});
