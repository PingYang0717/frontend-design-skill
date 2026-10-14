/** localStorage key 的唯一來源。前綴統一,避免與同網域其他系統衝突。 */
const PREFIX = 'app';

export const LAYOUT_STORAGE_KEY = `${PREFIX}:layout`;
export const SESSION_STORAGE_KEY = `${PREFIX}:session`;
