import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

import { getCurrentUser } from '@/api/authApi';

export const currentUserQueryKey = ['currentUser'] as const;

export const currentUserQuery = queryOptions({
  queryKey: currentUserQueryKey,
  queryFn: getCurrentUser,
  // 身分在一次瀏覽中幾乎不變,不必每次回到視窗就重抓。
  staleTime: 5 * 60 * 1000,
});

export const useCurrentUser = () => useSuspenseQuery(currentUserQuery).data;
