/** 清單端點的最小防線:回應不是陣列就丟錯,讓 ErrorBoundary 顯示錯誤卡,而不是在 render 時炸在 `.map`。 */
export const expectArray = <T>(value: unknown, endpoint: string): T[] => {
  if (!Array.isArray(value)) {
    throw new TypeError(`Expected an array from ${endpoint}`);
  }
  return value as T[];
};
