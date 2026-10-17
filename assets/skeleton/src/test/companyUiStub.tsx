import React from 'react';

import type { CompanyAccessBlockedProps } from '@/vendor/companyUi';

/** 測試用的公司套件替身:setup.ts 以 vi.mock 把 @/vendor/companyUi 換成這個檔案,
 *  測試不載入公司套件(它可能需要 SDK 初始化、瀏覽器 API 或網路)。只保留測試需要斷言的東西:
 *  遮罩有出現、是哪一種。 */
export const CompanyAccessBlocked: React.FC<CompanyAccessBlockedProps> = ({ kind }) => (
  <div role="alertdialog" aria-modal="true" data-testid="access-blocked" data-kind={kind} />
);
