import { useEffect, useState } from 'react';

/** 搜尋輸入用:輸入框綁原值,過濾綁這裡回傳的穩定值。 */
export const useDebouncedValue = <T>(value: T, delayMs = 300): T => {
  const [settled, setSettled] = useState(value);

  // 同步外部系統(計時器),需要 cleanup。
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return settled;
};
