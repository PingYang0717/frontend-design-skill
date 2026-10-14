import { App } from 'antd';
import { useQueryClient } from '@tanstack/react-query';

import { createItem, deleteItem } from '@/api/itemApi';
import { useActionMutation } from './useActionMutation';
import { itemsQueryKey } from './useItems';

export const useCreateItem = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useActionMutation({
    mutationFn: createItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: itemsQueryKey, exact: true });
      message.success('已新增項目');
    },
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useActionMutation({
    mutationFn: deleteItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: itemsQueryKey, exact: true });
      message.success('已刪除項目');
    },
  });
};
