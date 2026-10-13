/** 範例資源。新專案依 API 契約取代這個檔案。 */
export interface Item {
  id: string;
  name: string;
  status: ItemStatus;
  updatedAt: string;
}

export type ItemStatus = 'ACTIVE' | 'ARCHIVED';

export interface CreateItemRequest {
  name: string;
}
