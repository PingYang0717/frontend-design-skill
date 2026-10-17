import React from 'react';
import { Result } from 'antd';

import type { AccessGateKind } from '@/app/accessGate';

import styles from './companyUi.module.css';

/** 公司共用前端套件的唯一轉接點:登入 SDK、整頁遮罩、(選用時)公司公版外殼都從這裡匯出,
 *  專案其他地方不直接 import 公司套件;換套件版本或 props 只改這個檔案(docs/conventions/access.md 第 2 節)。
 *
 *  新專案收件時填:
 *  1. 把下面的 FallbackAccessBlocked 換成公司套件的遮罩元件,例如
 *     `import { AccessBlocked } from '{{COMPANY_UI_PACKAGE}}';` 並對應 props(kind → 它的 variant / reason)。
 *  2. 外殼採用公司公版時,在這裡匯出 `CompanyShell`,並依 access.md 第 4 節改 RootLayout。
 *  測試一律用 src/test/companyUiStub.tsx(test/setup.ts 以 vi.mock 換掉),不會載入公司套件。 */

export interface CompanyAccessBlockedProps {
  kind: AccessGateKind;
}

const FALLBACK_COPY: Record<AccessGateKind, { title: string; description: string }> = {
  outsideNetwork: { title: '請在公司網路內使用', description: '這個系統只能在公司網路或 VPN 環境使用。' },
  noAppPermission: { title: '沒有這個系統的使用權限', description: '請向系統負責人申請權限後重新整理。' },
};

/** 骨架自帶的替代遮罩:讓沒接公司套件的骨架也能跑;專案接上公司套件後刪除。 */
const FallbackAccessBlocked: React.FC<CompanyAccessBlockedProps> = ({ kind }) => (
  <div className={styles.mask} role="alertdialog" aria-modal="true" aria-label={FALLBACK_COPY[kind].title}>
    <Result status="403" title={FALLBACK_COPY[kind].title} subTitle={FALLBACK_COPY[kind].description} />
  </div>
);

export const CompanyAccessBlocked: React.FC<CompanyAccessBlockedProps> = FallbackAccessBlocked;
