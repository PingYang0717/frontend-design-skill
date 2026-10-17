import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { AccessGateKind } from '@/app/accessGate';

interface AccessState {
  /** 被哪一種閘門擋住;null 代表正常。只由 app/accessGate.ts 的 interceptor 寫入。 */
  blocked: AccessGateKind | null;
  block: (kind: AccessGateKind) => void;
  reset: () => void;
}

/** 不 persist:重新整理就重新檢查(公司網路、權限都可能在這段時間改變)。 */
export const useAccessStore = create<AccessState>()(
  devtools(
    (set) => ({
      blocked: null,
      block: (kind) => set({ blocked: kind }, false, 'block'),
      reset: () => set({ blocked: null }, false, 'reset'),
    }),
    { name: 'Access' }
  )
);
