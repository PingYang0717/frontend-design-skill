import type { CreateItemRequest, Item } from '@/types/api/item';
import { apiClient } from './apiClient';
import { apiPath } from './apiPath';
import { expectArray } from './expectArray';

/** 範例 endpoint module:一個資源一個檔案,每個端點一個具名函式。 */

export const listItems = async (): Promise<Item[]> =>
  expectArray<Item>(await apiClient.get<unknown>(apiPath('items')), 'GET /items');

export const createItem = (body: CreateItemRequest): Promise<Item> => apiClient.post<Item>(apiPath('items'), body);

export const deleteItem = (id: string): Promise<void> => apiClient.delete(apiPath('items', id));
