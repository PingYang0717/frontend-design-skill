/** 所有路徑的唯一來源。頁面、選單、連結都從這裡取,不在別處手打路徑字串。 */
export const ROUTES = {
  home: '/',
  login: '/login',
  items: '/items',
  forbidden: '/403',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
