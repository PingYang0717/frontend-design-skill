import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';

import { getCurrentUser } from '@/api/authApi';
import { zhTW as t } from '@/i18n/zhTW';
import { TEST_USER } from '@/test/fixtures';
import { renderApp } from '@/test/renderApp';

describe('RequirePermission', () => {
  it('sends a user without the permission to the 403 page', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ ...TEST_USER, permissions: [] });
    const { router } = renderApp('/items');

    expect(await screen.findByText(t.pages.forbidden.title)).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/403');
  });

  it('hides the menu entry the user cannot open', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ ...TEST_USER, permissions: [] });
    renderApp('/');

    expect(await screen.findByText(t.pages.home.welcome(TEST_USER.name))).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: t.nav.items })).not.toBeInTheDocument();
  });
});
