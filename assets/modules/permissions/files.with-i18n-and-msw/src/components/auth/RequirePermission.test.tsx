import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { zhTW as t } from '@/i18n/zhTW';
import { db } from '@/mocks/db';
import { renderApp } from '@/test/renderApp';

/** 權限守衛範本:db.permissions 預設是全部權限;要測「沒有權限」就在測試裡改掉。 */
describe('RequirePermission', () => {
  it('sends a user without the permission to the 403 page', async () => {
    db.permissions = [];
    const { router } = renderApp('/items');

    expect(await screen.findByText(t.pages.forbidden.title)).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/403');
  });

  it('hides the menu entry the user cannot open', async () => {
    db.permissions = [];
    renderApp('/');

    expect(await screen.findByText(t.pages.home.welcome(t.app.name))).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: t.nav.items })).not.toBeInTheDocument();
  });
});
