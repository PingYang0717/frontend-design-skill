import { App } from 'antd';

import { describeActionError } from '@/utils/describeError';

/** 寫入失敗的預設回報方式:一行 toast,文案依錯誤 code 決定。 */
export const useActionErrorToast = () => {
  const { message } = App.useApp();

  return (error: unknown) => {
    message.error(describeActionError(error));
  };
};
