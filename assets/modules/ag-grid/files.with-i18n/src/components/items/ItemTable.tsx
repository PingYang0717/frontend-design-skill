import React from 'react';
import type { ColDef, ValueFormatterParams } from 'ag-grid-community';
import type { CustomCellRendererProps } from 'ag-grid-react';
import { Tag } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

import DataGrid from '@/components/common/DataGrid';
import IconButton from '@/components/common/IconButton';
import { useConfirmDestructive } from '@/hooks/useConfirmDestructive';
import { useDeleteItem } from '@/hooks/useItemMutations';
import { useItems } from '@/hooks/useItems';
import { useTranslations } from '@/i18n/useTranslations';
import type { Item } from '@/types/api/item';

/** 儲存格元件範本:cellRenderer 給一個 React 元件,props.data 是該列的 DTO(過濾中可能是 undefined)。 */
const StatusCell: React.FC<CustomCellRendererProps<Item>> = ({ data }) => {
  const t = useTranslations();

  if (!data) {
    return null;
  }
  return <Tag color={data.status === 'ACTIVE' ? 'success' : 'default'}>{t.items.status[data.status]}</Tag>;
};

/** 操作欄範本:刪除走 useConfirmDestructive。hook 在儲存格元件裡照常可用;選了 permissions 模組時寫入按鈕包 RequirePermission。 */
const ActionsCell: React.FC<CustomCellRendererProps<Item>> = ({ data }) => {
  const deleteItem = useDeleteItem();
  const confirmDestructive = useConfirmDestructive();
  const t = useTranslations();

  if (!data) {
    return null;
  }
  return (
    <IconButton
      danger
      icon={<DeleteOutlined />}
      label={t.items.delete.label(data.name)}
      loading={deleteItem.isPending && deleteItem.variables === data.id}
      onClick={() =>
        confirmDestructive({
          title: t.items.delete.confirmTitle(data.name),
          content: t.items.delete.confirmContent,
          onConfirm: () => deleteItem.mutateAsync(data.id),
        })
      }
    />
  );
};

interface ItemTableProps {
  /** 已 debounce 的搜尋字串。 */
  keyword: string;
}

/** 表格範本:資料從 hook 來(useSuspenseQuery,不處理 loading/error,交給外層 DataBoundary),表格用 DataGrid。 */
const ItemTable: React.FC<ItemTableProps> = ({ keyword }) => {
  const items = useItems();
  const t = useTranslations();

  const normalizedKeyword = keyword.trim().toLowerCase();
  const visibleItems = normalizedKeyword
    ? items.filter((item) => item.name.toLowerCase().includes(normalizedKeyword))
    : items;

  const columns: ColDef<Item>[] = [
    { field: 'name', headerName: t.items.columns.name },
    { field: 'status', headerName: t.items.columns.status, cellRenderer: StatusCell, maxWidth: 160 },
    {
      field: 'updatedAt',
      headerName: t.items.columns.updatedAt,
      valueFormatter: ({ value }: ValueFormatterParams<Item, string>) =>
        value ? new Date(value).toLocaleString() : '',
    },
    {
      colId: 'actions',
      headerName: t.common.actions,
      cellRenderer: ActionsCell,
      width: 96,
      flex: 0,
      sortable: false,
      resizable: false,
    },
  ];

  return (
    <DataGrid<Item>
      rowData={visibleItems}
      columnDefs={columns}
      getRowId={({ data }) => data.id}
      overlayNoRowsTemplate={t.items.empty}
    />
  );
};

export default ItemTable;
