import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MOCK_LOGIN } from '@/mocks/db';
import { server } from '@/mocks/server';
import { useSessionStore } from '@/stores/useSessionStore';
import { renderApp } from '@/test/renderApp';

describe('RequireAuth', () => {
  it('sends a visitor without a session to the login page and back after signing in', async () => {
    useSessionStore.setState({ accessToken: null });
    const user = userEvent.setup();
    const { router } = renderApp('/items');

    await screen.findByRole('button', { name: '登入' });
    expect(router.state.location.pathname).toBe('/login');

    await user.type(screen.getByLabelText('帳號'), MOCK_LOGIN.username);
    await user.type(screen.getByLabelText('密碼'), MOCK_LOGIN.password);
    await user.click(screen.getByRole('button', { name: '登入' }));

    expect(await screen.findByText('範例項目 A')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/items');
  });

  it('clears the session and returns to the login page when the backend answers 401', async () => {
    server.use(http.get('*/api/items', () => HttpResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })));
    const { router } = renderApp('/items');

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
    expect(useSessionStore.getState().accessToken).toBeNull();
  });
});
