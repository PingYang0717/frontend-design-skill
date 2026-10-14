import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { getCurrentUser } from '@/api/authApi';
import { createItem, deleteItem, listItems } from '@/api/itemApi';
import { PERMISSIONS } from '@/constants/permissions';
import { TEST_USER, testItems } from '@/test/fixtures';
import { renderApp } from '@/test/renderApp';
import { responseError } from '@/test/responseError';
import type { Item } from '@/types/api/item';

vi.mock('@/api/itemApi');

/** 這個檔案的假後端:API 函式讀寫同一份陣列,新增後重新抓取就看得到新資料。 */
let items: Item[];

beforeEach(() => {
  items = testItems();
  vi.mocked(listItems).mockImplementation(async () => items);
  vi.mocked(createItem).mockImplementation(async ({ name }) => {
    const item: Item = { id: `item-${items.length + 1}`, name, status: 'ACTIVE', updatedAt: new Date().toISOString() };
    items = [item, ...items];
    return item;
  });
  vi.mocked(deleteItem).mockImplementation(async (id) => {
    items = items.filter((item) => item.id !== id);
  });
});

/** 頁面測試範本:從網址進入、經過真的 Provider 與路由;API 模組由 vi.mock 換掉。 */
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
    expect(vi.mocked(createItem)).toHaveBeenCalledWith({ name: '新的項目' }, expect.anything());
  });

  it('hides write actions from a read-only user', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ ...TEST_USER, permissions: [PERMISSIONS.itemsRead] });
    renderApp('/items');
    await screen.findByText('範例項目 A');

    expect(screen.queryByRole('button', { name: /新增/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '刪除 範例項目 A' })).not.toBeInTheDocument();
  });

  it('shows an error card with retry when the list fails to load', async () => {
    vi.mocked(listItems).mockRejectedValueOnce(responseError(500, { code: 'BOOM' }));
    renderApp('/items');

    expect(await screen.findByText('項目載入失敗')).toBeInTheDocument();

    await userEvent.setup().click(screen.getByRole('button', { name: '重試' }));
    await waitFor(() => expect(screen.getByText('範例項目 A')).toBeInTheDocument());
  });
});
