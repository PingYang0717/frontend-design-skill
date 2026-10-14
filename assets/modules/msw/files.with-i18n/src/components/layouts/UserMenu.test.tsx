import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { zhTW as t } from '@/i18n/zhTW';
import { db } from '@/mocks/db';
import { useSessionStore } from '@/stores/useSessionStore';
import { renderApp } from '@/test/renderApp';

describe('UserMenu', () => {
  it('signs the user out from the header menu', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/');

    // 帶圖示的按鈕,無障礙名稱會包含圖示的名稱,所以用部分比對。
    await user.click(await screen.findByRole('button', { name: new RegExp(db.currentUser.name) }));
    await user.click(await screen.findByRole('menuitem', { name: new RegExp(t.header.logout) }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
    expect(useSessionStore.getState().accessToken).toBeNull();
  });
});
