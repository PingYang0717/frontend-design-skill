import { describe, expect, it } from 'vitest';

import { KNOWN_ERROR_CODES } from '@/types/api/error';
import { en } from './en';
import { zhTW } from './zhTW';

/** 每個已知的錯誤 code 都要有文案;新增 code 卻忘了寫字典時,這支測試會失敗。 */
describe('error code coverage', () => {
  it.each(KNOWN_ERROR_CODES)('%s has copy in every language', (code) => {
    expect(zhTW.errors.byCode[code]).toBeTruthy();
    expect(en.errors.byCode[code]).toBeTruthy();
  });
});
