import React, { useState } from 'react';
import { Button, Card, Flex, Input } from 'antd';
import { useSearchParams } from 'react-router';
import { PlusOutlined } from '@ant-design/icons';

import DataBoundary from '@/components/common/DataBoundary';
import ItemCreateDialog from '@/components/items/ItemCreateDialog';
import ItemTable from '@/components/items/ItemTable';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTranslations } from '@/i18n/useTranslations';

/** 頁面範本:只組裝與放邊界,不寫業務邏輯。搜尋條件放 URL,重新整理與分享連結都保得住。 */
const ItemsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const t = useTranslations();

  const [isCreateOpen, setCreateOpen] = useState(false);

  const keyword = searchParams.get('q') ?? '';
  const debouncedKeyword = useDebouncedValue(keyword);

  return (
    <Card
      title={t.items.title}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          {t.common.create}
        </Button>
      }
    >
      <Flex vertical gap={16}>
        <Input.Search
          allowClear
          aria-label={t.common.search}
          placeholder={t.items.searchPlaceholder}
          value={keyword}
          onChange={(event) => setSearchParams(event.target.value ? { q: event.target.value } : {}, { replace: true })}
        />
        <DataBoundary what={t.items.entity}>
          <ItemTable keyword={debouncedKeyword} />
        </DataBoundary>
      </Flex>
      <ItemCreateDialog open={isCreateOpen} onClose={() => setCreateOpen(false)} />
    </Card>
  );
};

export default ItemsPage;
