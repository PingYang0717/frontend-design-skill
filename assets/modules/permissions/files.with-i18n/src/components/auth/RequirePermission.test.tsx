import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';

import { getPermissions } from '@/api/permissionApi';
import { zhTW as t } from '@/i18n/zhTW';
import { renderApp } from '@/test/renderApp';

/** 權限守衛範本:setup.ts 讓 getPermissions 預設回傳全部權限;要測「沒有權限」就在測試裡覆寫。 */
describe('RequirePermission', () => {
  it('sends a user without the permission to the 403 page', async () => {
    vi.mocked(getPermissions).mockResolvedValue([]);
    const { router } = renderApp('/items');

    expect(await screen.findByText(t.pages.forbidden.title)).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/403');
  });

  it('hides the menu entry the user cannot open', async () => {
    vi.mocked(getPermissions).mockResolvedValue([]);
    renderApp('/');

    expect(await screen.findByText(t.pages.home.welcome(t.app.name))).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: t.nav.items })).not.toBeInTheDocument();
  });
});
