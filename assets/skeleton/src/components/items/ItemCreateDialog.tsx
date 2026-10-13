import React from 'react';
import { Form, Input, Modal } from 'antd';

import { useCreateItem } from '@/hooks/useItemMutations';
import { useTranslations } from '@/i18n/useTranslations';
import type { CreateItemRequest } from '@/types/api/item';

interface ItemCreateDialogProps {
  open: boolean;
  onClose: () => void;
}

/** 表單範本:簡單表單用 antd Form 即可,不另外引入表單函式庫。 */
const ItemCreateDialog: React.FC<ItemCreateDialogProps> = ({ open, onClose }) => {
  const [form] = Form.useForm<CreateItemRequest>();
  const createItem = useCreateItem();
  const t = useTranslations();

  const submit = async () => {
    const values = await form.validateFields();
    try {
      await createItem.mutateAsync(values);
    } catch {
      // 失敗已由 useActionMutation 以 toast 回報;對話框保持開啟,使用者填的內容不會消失。
      return;
    }
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      title={t.items.create.title}
      okText={t.common.create}
      cancelText={t.common.cancel}
      confirmLoading={createItem.isPending}
      onOk={submit}
      onCancel={onClose}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="name"
          label={t.items.create.nameLabel}
          rules={[{ required: true, whitespace: true, message: t.items.create.nameRequired }]}
        >
          <Input autoFocus />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ItemCreateDialog;
