import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise';

let isRegistered = false;

/** AG Grid Enterprise 的一次性設定:註冊全部模組、套用授權金鑰。由 providers.tsx 在模組載入時呼叫,
 *  元件不再各自 registerModules。金鑰放 `.env.local` 的 VITE_AG_GRID_LICENSE_KEY(它本來就會打進前端程式,
 *  不算機密);沒有金鑰仍可開發與測試,只是表格有試用水印與 console 警告(docs/conventions/data-grid.md)。 */
export const registerAgGrid = () => {
  if (isRegistered) {
    return;
  }
  isRegistered = true;
  ModuleRegistry.registerModules([AllEnterpriseModule]);

  const licenseKey = import.meta.env.VITE_AG_GRID_LICENSE_KEY;
  if (licenseKey) {
    LicenseManager.setLicenseKey(licenseKey);
  }
};
