import { App } from 'antd';

import { useTranslations } from '@/i18n/useTranslations';
import { describeActionError } from '@/utils/describeError';

/** 寫入失敗的預設回報方式:一行 toast,文案依錯誤 code 查字典。 */
export const useActionErrorToast = () => {
  const { message } = App.useApp();
  const t = useTranslations();

  return (error: unknown) => {
    message.error(describeActionError(error, t));
  };
};
