import React from 'react';
import { Form, Input, Modal } from 'antd';

import { useCreateItem } from '@/hooks/useItemMutations';
import type { CreateItemRequest } from '@/types/api/item';

interface ItemCreateDialogProps {
  open: boolean;
  onClose: () => void;
}

/** 表單範本:antd Form 管狀態與驗證,`Form.Item name` 一個欄位一個。
 *  型別用 types/api/ 的 request 型別,送出用 mutation 的 mutateAsync(docs/conventions/components.md)。 */
const ItemCreateDialog: React.FC<ItemCreateDialogProps> = ({ open, onClose }) => {
  const [form] = Form.useForm<CreateItemRequest>();
  const createItem = useCreateItem();

  const submit = async (values: CreateItemRequest) => {
    try {
      await createItem.mutateAsync(values);
    } catch {
      // 失敗已由 useActionMutation 以 toast 回報;對話框保持開啟,使用者填的內容不會消失。
      return;
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      title="新增項目"
      okText="新增"
      cancelText="取消"
      confirmLoading={createItem.isPending}
      onOk={() => form.submit()}
      onCancel={onClose}
      destroyOnHidden
    >
      {/* clearOnDestroy:對話框關閉時表單卸載並清空,下次打開是空白的,不必手動 resetFields。 */}
      <Form form={form} layout="vertical" clearOnDestroy onFinish={(values) => void submit(values)}>
        <Form.Item name="name" label="名稱" rules={[{ required: true, whitespace: true, message: '請輸入名稱' }]}>
          <Input autoFocus />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ItemCreateDialog;
