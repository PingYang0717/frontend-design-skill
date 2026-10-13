import { setupServer } from 'msw/node';

import { handlers } from './handlers';

/** 測試用的假後端,在 src/test/setup.ts 啟動。 */
export const server = setupServer(...handlers);
