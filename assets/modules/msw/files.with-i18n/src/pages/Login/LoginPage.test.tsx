import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { zhTW as t } from '@/i18n/zhTW';
import { db, MOCK_LOGIN } from '@/mocks/db';
import { useSessionStore } from '@/stores/useSessionStore';
import { renderApp } from '@/test/renderApp';

describe('Login page', () => {
  it('shows the backend error when the credentials are wrong', async () => {
    useSessionStore.setState({ accessToken: null });
    const user = userEvent.setup();
    const { router } = renderApp('/login');

    await user.type(await screen.findByLabelText(t.pages.login.username), MOCK_LOGIN.username);
    await user.type(screen.getByLabelText(t.pages.login.password), 'wrong');
    await user.click(screen.getByRole('button', { name: t.pages.login.submit }));

    expect(await screen.findByRole('alert')).toHaveTextContent(t.errors.byCode.INVALID_CREDENTIALS);
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
  });

  it('sends an already signed-in user to the home page', async () => {
    const { router } = renderApp('/login');

    expect(await screen.findByText(t.pages.home.welcome(db.currentUser.name))).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
  });
});
