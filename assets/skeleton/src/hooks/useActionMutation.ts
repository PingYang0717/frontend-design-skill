import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { useActionErrorToast } from './useActionErrorToast';

/** 所有寫入都用它:一個 useMutation,失敗時預設以 toast 回報。
 *  呼叫端覆寫 `onError` 會取代 toast(例如錯誤要顯示在表單裡),這種例外要在呼叫端註解寫理由。 */
export const useActionMutation = <TData = unknown, TVariables = void, TOnMutateResult = unknown>(
  options: UseMutationOptions<TData, unknown, TVariables, TOnMutateResult>
) => {
  const toastError = useActionErrorToast();

  return useMutation({
    ...options,
    onError: (error, ...rest) => (options.onError ?? toastError)(error, ...rest),
  });
};
