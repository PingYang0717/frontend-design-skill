import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';

import { getPermissions } from '@/api/permissionApi';
import { APP_NAME } from '@/constants/app';
import { renderApp } from '@/test/renderApp';

/** 權限守衛範本:setup.ts 讓 getPermissions 預設回傳全部權限;要測「沒有權限」就在測試裡覆寫。 */
describe('RequirePermission', () => {
  it('sends a user without the permission to the 403 page', async () => {
    vi.mocked(getPermissions).mockResolvedValue([]);
    const { router } = renderApp('/items');

    expect(await screen.findByText('沒有權限')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/403');
  });

  it('hides the menu entry the user cannot open', async () => {
    vi.mocked(getPermissions).mockResolvedValue([]);
    renderApp('/');

    expect(await screen.findByText(`歡迎使用${APP_NAME}。`)).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: '項目管理' })).not.toBeInTheDocument();
  });
});
