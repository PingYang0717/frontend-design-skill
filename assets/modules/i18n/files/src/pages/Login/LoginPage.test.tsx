import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { login } from '@/api/authApi';
import { zhTW as t } from '@/i18n/zhTW';
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

    await user.type(await screen.findByLabelText(t.pages.login.username), 'admin');
    await user.type(screen.getByLabelText(t.pages.login.password), 'wrong');
    await user.click(screen.getByRole('button', { name: t.pages.login.submit }));

    expect(await screen.findByRole('alert')).toHaveTextContent(t.errors.byCode.INVALID_CREDENTIALS);
    expect(vi.mocked(login)).toHaveBeenCalledWith({ username: 'admin', password: 'wrong' }, expect.anything());
    expect(router.state.location.pathname).toBe('/login');
    expect(useSessionStore.getState().accessToken).toBeNull();
  });

  it('asks for both fields before submitting', async () => {
    useSessionStore.setState({ accessToken: null });
    const user = userEvent.setup();
    renderApp('/login');

    await user.click(await screen.findByRole('button', { name: t.pages.login.submit }));

    expect(await screen.findByText(t.pages.login.usernameRequired)).toBeInTheDocument();
    expect(screen.getByText(t.pages.login.passwordRequired)).toBeInTheDocument();
    expect(vi.mocked(login)).not.toHaveBeenCalled();
  });

  it('sends an already signed-in user to the home page', async () => {
    const { router } = renderApp('/login');

    expect(await screen.findByText(t.pages.home.welcome(TEST_USER.name))).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
  });
});
