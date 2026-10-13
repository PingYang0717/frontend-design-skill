import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { LAYOUT_STORAGE_KEY } from '@/constants/storage';

interface LayoutState {
  isSiderCollapsed: boolean;
  setSiderCollapsed: (isSiderCollapsed: boolean) => void;
}

export const useLayoutStore = create<LayoutState>()(
  devtools(
    persist(
      (set) => ({
        isSiderCollapsed: false,
        setSiderCollapsed: (isSiderCollapsed) => set({ isSiderCollapsed }, false, 'setSiderCollapsed'),
      }),
      { name: LAYOUT_STORAGE_KEY }
    ),
    { name: 'Layout' }
  )
);
