import React from 'react';
import { Form, Input, Modal } from 'antd';
import { useForm } from 'react-hook-form';

import FormField from '@/components/common/FormField';
import { useCreateItem } from '@/hooks/useItemMutations';
import { useTranslations } from '@/i18n/useTranslations';
import type { CreateItemRequest } from '@/types/api/item';

interface ItemCreateDialogProps {
  open: boolean;
  onClose: () => void;
}

/** 表單範本:React Hook Form 管狀態與驗證,antd 只負責版面與輸入元件,每個欄位一個 FormField。
 *  型別用 types/api/ 的 request 型別,送出用 mutation 的 mutateAsync(docs/conventions/forms.md)。 */
const ItemCreateDialog: React.FC<ItemCreateDialogProps> = ({ open, onClose }) => {
  const { control, handleSubmit, reset } = useForm<CreateItemRequest>({ defaultValues: { name: '' } });
  const createItem = useCreateItem();
  const t = useTranslations();

  const submit = handleSubmit(async (values) => {
    try {
      await createItem.mutateAsync(values);
    } catch {
      // 失敗已由 useActionMutation 以 toast 回報;對話框保持開啟,使用者填的內容不會消失。
      return;
    }
    reset();
    onClose();
  });

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      title={t.items.create.title}
      okText={t.common.create}
      cancelText={t.common.cancel}
      confirmLoading={createItem.isPending}
      onOk={() => void submit()}
      onCancel={close}
      destroyOnHidden
    >
      <Form layout="vertical" onFinish={() => void submit()}>
        <FormField
          control={control}
          name="name"
          label={t.items.create.nameLabel}
          rules={{
            required: t.items.create.nameRequired,
            validate: (value) => value.trim() !== '' || t.items.create.nameRequired,
          }}
        >
          {(field) => <Input {...field} autoFocus />}
        </FormField>
      </Form>
    </Modal>
  );
};

export default ItemCreateDialog;
