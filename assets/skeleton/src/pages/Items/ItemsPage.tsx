import React, { useState } from 'react';
import { Button, Card, Flex, Input } from 'antd';
import { useSearchParams } from 'react-router';
import { PlusOutlined } from '@ant-design/icons';

import DataBoundary from '@/components/common/DataBoundary';
import ItemCreateDialog from '@/components/items/ItemCreateDialog';
import ItemTable from '@/components/items/ItemTable';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

/** 頁面範本:只組裝與放邊界,不寫業務邏輯。搜尋條件放 URL,重新整理與分享連結都保得住。 */
const ItemsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [isCreateOpen, setCreateOpen] = useState(false);

  const keyword = searchParams.get('q') ?? '';
  const debouncedKeyword = useDebouncedValue(keyword);

  return (
    <Card
      title="項目管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          新增
        </Button>
      }
    >
      <Flex vertical gap={16}>
        <Input.Search
          allowClear
          aria-label="搜尋"
          placeholder="依名稱搜尋"
          value={keyword}
          onChange={(event) => setSearchParams(event.target.value ? { q: event.target.value } : {}, { replace: true })}
        />
        <DataBoundary what="項目">
          <ItemTable keyword={debouncedKeyword} />
        </DataBoundary>
      </Flex>
      <ItemCreateDialog open={isCreateOpen} onClose={() => setCreateOpen(false)} />
    </Card>
  );
};

export default ItemsPage;
