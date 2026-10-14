import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { db } from '@/mocks/db';
import { server } from '@/mocks/server';
import { renderApp } from '@/test/renderApp';

/** 頁面測試範本:從網址進入、經過真的 Provider 與路由、打 MSW 假後端。 */
describe('Items page', () => {
  it('lists the items from the backend', async () => {
    renderApp('/items');

    expect(await screen.findByText('範例項目 A')).toBeInTheDocument();
    expect(screen.getByText('已封存')).toBeInTheDocument();
  });

  it('filters by the keyword in the URL', async () => {
    renderApp('/items?q=B');

    expect(await screen.findByText('範例項目 B')).toBeInTheDocument();
    expect(screen.queryByText('範例項目 A')).not.toBeInTheDocument();
  });

  it('creates an item and shows it in the list', async () => {
    const user = userEvent.setup();
    renderApp('/items');
    await screen.findByText('範例項目 A');

    // 帶圖示的按鈕,無障礙名稱會包含圖示的名稱,所以用部分比對。
    await user.click(screen.getByRole('button', { name: /新增/ }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('名稱'), '新的項目');
    await user.click(within(dialog).getByRole('button', { name: '新增' }));

    expect(await screen.findByText('新的項目')).toBeInTheDocument();
  });

  it('hides write actions from a read-only user', async () => {
    db.currentUser = { ...db.currentUser, permissions: ['items:read'] };
    renderApp('/items');
    await screen.findByText('範例項目 A');

    expect(screen.queryByRole('button', { name: /新增/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '刪除 範例項目 A' })).not.toBeInTheDocument();
  });

  it('shows an error card with retry when the list fails to load', async () => {
    server.use(http.get('*/api/items', () => HttpResponse.json({ code: 'BOOM' }, { status: 500 })));
    renderApp('/items');

    expect(await screen.findByText('項目載入失敗')).toBeInTheDocument();

    server.resetHandlers();
    await userEvent.setup().click(screen.getByRole('button', { name: '重試' }));
    await waitFor(() => expect(screen.getByText('範例項目 A')).toBeInTheDocument());
  });
});
