import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';

import { getCurrentUser } from '@/api/authApi';
import { TEST_USER } from '@/test/fixtures';
import { renderApp } from '@/test/renderApp';

describe('RequirePermission', () => {
  it('sends a user without the permission to the 403 page', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ ...TEST_USER, permissions: [] });
    const { router } = renderApp('/items');

    expect(await screen.findByText('沒有權限')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/403');
  });

  it('hides the menu entry the user cannot open', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ ...TEST_USER, permissions: [] });
    renderApp('/');

    expect(await screen.findByText(`歡迎回來,${TEST_USER.name}`)).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: '項目管理' })).not.toBeInTheDocument();
  });
});
