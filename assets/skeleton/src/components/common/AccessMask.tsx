import React from 'react';

import { useAccessStore } from '@/stores/useAccessStore';
import { CompanyAccessBlocked } from '@/vendor/companyUi';

/** 存取閘門的整頁遮罩:任何 API 被「公司網路外」或「沒有系統權限」擋下,就蓋住整個畫面,不能關閉。
 *  掛在 AppProviders 裡(所有頁面與外殼之上),不依賴路由,換成公司公版外殼也照樣生效。 */
const AccessMask: React.FC = () => {
  const blocked = useAccessStore((state) => state.blocked);

  return blocked === null ? null : <CompanyAccessBlocked kind={blocked} />;
};

export default AccessMask;
