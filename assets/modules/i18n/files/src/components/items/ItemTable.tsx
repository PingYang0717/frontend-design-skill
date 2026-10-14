import React from 'react';
import { Table, type TableColumnsType, Tag } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

import Can from '@/components/auth/Can';
import IconButton from '@/components/common/IconButton';
import { PERMISSIONS } from '@/constants/permissions';
import { useConfirmDestructive } from '@/hooks/useConfirmDestructive';
import { useDeleteItem } from '@/hooks/useItemMutations';
import { useItems } from '@/hooks/useItems';
import { useTranslations } from '@/i18n/useTranslations';
import type { Item, ItemStatus } from '@/types/api/item';

/** 操作欄範本:寫入動作用 Can 包住,刪除走 useConfirmDestructive。 */
const ItemActions: React.FC<{ item: Item }> = ({ item }) => {
  const deleteItem = useDeleteItem();
  const confirmDestructive = useConfirmDestructive();
  const t = useTranslations();

  return (
    <Can permission={PERMISSIONS.itemsWrite}>
      <IconButton
        danger
        icon={<DeleteOutlined />}
        label={t.items.delete.label(item.name)}
        loading={deleteItem.isPending && deleteItem.variables === item.id}
        onClick={() =>
          confirmDestructive({
            title: t.items.delete.confirmTitle(item.name),
            content: t.items.delete.confirmContent,
            onConfirm: () => deleteItem.mutateAsync(item.id),
          })
        }
      />
    </Can>
  );
};

interface ItemTableProps {
  /** 已 debounce 的搜尋字串。 */
  keyword: string;
}

/** 表格範本:資料從 hook 來(useSuspenseQuery,不處理 loading/error,交給外層 DataBoundary),表格用 antd Table。 */
const ItemTable: React.FC<ItemTableProps> = ({ keyword }) => {
  const items = useItems();
  const t = useTranslations();

  const normalizedKeyword = keyword.trim().toLowerCase();
  const visibleItems = normalizedKeyword
    ? items.filter((item) => item.name.toLowerCase().includes(normalizedKeyword))
    : items;

  const columns: TableColumnsType<Item> = [
    { title: t.items.columns.name, dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    {
      title: t.items.columns.status,
      dataIndex: 'status',
      width: 160,
      render: (status: ItemStatus) => (
        <Tag color={status === 'ACTIVE' ? 'success' : 'default'}>{t.items.status[status]}</Tag>
      ),
    },
    {
      title: t.items.columns.updatedAt,
      dataIndex: 'updatedAt',
      sorter: (a, b) => a.updatedAt.localeCompare(b.updatedAt),
      render: (value: string) => new Date(value).toLocaleString(),
    },
    { title: t.common.actions, key: 'actions', width: 96, render: (_, item) => <ItemActions item={item} /> },
  ];

  return (
    <Table<Item>
      rowKey="id"
      dataSource={visibleItems}
      columns={columns}
      pagination={false}
      locale={{ emptyText: t.items.empty }}
    />
  );
};

export default ItemTable;
