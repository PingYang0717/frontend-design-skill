import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';

import { responseError } from '@/test/responseError';
import { errorCode, errorMessage, isCanceled, isNotFound, isOffline } from './apiError';

describe('apiError', () => {
  it('reads the backend code and message from the body', () => {
    const error = responseError(409, { code: 'CONFLICT', message: 'duplicate key' });
    expect(errorCode(error)).toBe('CONFLICT');
    expect(errorMessage(error)).toBe('duplicate key');
  });

  it('treats only 404 as not found', () => {
    expect(isNotFound(responseError(404, {}))).toBe(true);
    expect(isNotFound(responseError(500, {}))).toBe(false);
  });

  it('tells offline apart from a backend answer', () => {
    expect(isOffline(new AxiosError('Network Error', 'ERR_NETWORK'))).toBe(true);
    expect(isOffline(responseError(500, {}))).toBe(false);
  });

  it('recognises a cancelled request by name', () => {
    expect(isCanceled(Object.assign(new Error('aborted'), { name: 'AbortError' }))).toBe(true);
  });
});
