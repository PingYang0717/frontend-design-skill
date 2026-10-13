import { App } from 'antd';
import { useQueryClient } from '@tanstack/react-query';

import { createItem, deleteItem } from '@/api/itemApi';
import { useTranslations } from '@/i18n/useTranslations';
import { useActionMutation } from './useActionMutation';
import { itemsQueryKey } from './useItems';

export const useCreateItem = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const t = useTranslations();

  return useActionMutation({
    mutationFn: createItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: itemsQueryKey, exact: true });
      message.success(t.items.create.success);
    },
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const t = useTranslations();

  return useActionMutation({
    mutationFn: deleteItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: itemsQueryKey, exact: true });
      message.success(t.items.delete.success);
    },
  });
};
