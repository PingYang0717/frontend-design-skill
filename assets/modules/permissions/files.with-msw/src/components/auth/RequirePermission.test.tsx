import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { APP_NAME } from '@/constants/app';
import { db } from '@/mocks/db';
import { renderApp } from '@/test/renderApp';

/** 權限守衛範本:db.permissions 預設是全部權限;要測「沒有權限」就在測試裡改掉。 */
describe('RequirePermission', () => {
  it('sends a user without the permission to the 403 page', async () => {
    db.permissions = [];
    const { router } = renderApp('/items');

    expect(await screen.findByText('沒有權限')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/403');
  });

  it('hides the menu entry the user cannot open', async () => {
    db.permissions = [];
    renderApp('/');

    expect(await screen.findByText(`歡迎使用${APP_NAME}。`)).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: '項目管理' })).not.toBeInTheDocument();
  });
});
