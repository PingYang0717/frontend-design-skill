import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

import { listItems } from '@/api/itemApi';

/** 資料 hook 範本:每種資料一個 queryOptions 定義,讀它的 hook 都引用它;mutation 用同一個 key 失效。 */
export const itemsQueryKey = ['items'] as const;

export const itemsQuery = queryOptions({
  queryKey: itemsQueryKey,
  queryFn: listItems,
});

export const useItems = () => useSuspenseQuery(itemsQuery).data;
