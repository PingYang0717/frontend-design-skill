import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { logout } from '@/api/authApi';
import { zhTW as t } from '@/i18n/zhTW';
import { useSessionStore } from '@/stores/useSessionStore';
import { TEST_USER } from '@/test/fixtures';
import { renderApp } from '@/test/renderApp';

describe('UserMenu', () => {
  it('signs the user out from the header menu', async () => {
    vi.mocked(logout).mockResolvedValue();
    const user = userEvent.setup();
    const { router } = renderApp('/');

    // 帶圖示的按鈕,無障礙名稱會包含圖示的名稱,所以用部分比對。
    await user.click(await screen.findByRole('button', { name: new RegExp(TEST_USER.name) }));
    await user.click(await screen.findByRole('menuitem', { name: new RegExp(t.header.logout) }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
    expect(useSessionStore.getState().accessToken).toBeNull();
  });
});
