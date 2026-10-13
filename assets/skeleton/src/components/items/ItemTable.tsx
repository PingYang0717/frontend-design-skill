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
import type { Item } from '@/types/api/item';

interface ItemTableProps {
  /** 已 debounce 的搜尋字串。 */
  keyword: string;
}

/** 元件範本:資料從 hook 來(useSuspenseQuery,不處理 loading/error,交給外層 DataBoundary)。 */
const ItemTable: React.FC<ItemTableProps> = ({ keyword }) => {
  const items = useItems();
  const deleteItem = useDeleteItem();
  const confirmDestructive = useConfirmDestructive();
  const t = useTranslations();

  const normalizedKeyword = keyword.trim().toLowerCase();
  const visibleItems = normalizedKeyword
    ? items.filter((item) => item.name.toLowerCase().includes(normalizedKeyword))
    : items;

  const columns: TableColumnsType<Item> = [
    { title: t.items.columns.name, dataIndex: 'name', key: 'name' },
    {
      title: t.items.columns.status,
      dataIndex: 'status',
      key: 'status',
      render: (_, item) => (
        <Tag color={item.status === 'ACTIVE' ? 'success' : 'default'}>{t.items.status[item.status]}</Tag>
      ),
    },
    {
      title: t.items.columns.updatedAt,
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (_, item) => new Date(item.updatedAt).toLocaleString(),
    },
    {
      title: t.common.actions,
      key: 'actions',
      width: 80,
      render: (_, item) => (
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
      ),
    },
  ];

  return (
    <Table<Item>
      rowKey="id"
      columns={columns}
      dataSource={visibleItems}
      locale={{ emptyText: t.items.empty }}
      pagination={false}
    />
  );
};

export default ItemTable;
