import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { zhTW as t } from '@/i18n/zhTW';
import { db } from '@/mocks/db';
import { renderApp } from '@/test/renderApp';

describe('RequirePermission', () => {
  it('sends a user without the permission to the 403 page', async () => {
    db.currentUser = { ...db.currentUser, permissions: [] };
    const { router } = renderApp('/items');

    expect(await screen.findByText(t.pages.forbidden.title)).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/403');
  });

  it('hides the menu entry the user cannot open', async () => {
    db.currentUser = { ...db.currentUser, permissions: [] };
    renderApp('/');

    expect(await screen.findByText(t.pages.home.welcome(db.currentUser.name))).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: t.nav.items })).not.toBeInTheDocument();
  });
});
