import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

let isRegistered = false;

/** AG Grid Community 的一次性設定:註冊全部 Community 模組。由 providers.tsx 在模組載入時呼叫,
 *  元件不再各自 registerModules。Community 不需要授權金鑰;要用 Enterprise 功能前先改 docs/adr/0022(docs/conventions/ag-grid.md)。 */
export const registerAgGrid = () => {
  if (isRegistered) {
    return;
  }
  isRegistered = true;
  ModuleRegistry.registerModules([AllCommunityModule]);
};
