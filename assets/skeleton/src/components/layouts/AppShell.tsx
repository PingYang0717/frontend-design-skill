import React from 'react';
import { Layout, Menu } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router';

import DataBoundary from '@/components/common/DataBoundary';
import { APP_NAME } from '@/constants/app';
import { useLayoutStore } from '@/stores/useLayoutStore';
import AppHeader from './AppHeader';
import { NAV_ENTRIES } from './navEntries';

import styles from './AppShell.module.css';

/** 外殼:header + 側欄選單 + 內容區。內容區自己包一個 DataBoundary,頁面失敗時外殼仍在。 */
const AppShell: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isSiderCollapsed = useLayoutStore((state) => state.isSiderCollapsed);

  const menuItems = NAV_ENTRIES.map((entry) => ({
    key: entry.path,
    icon: entry.icon,
    label: entry.label,
  }));

  return (
    <Layout className={styles.shell}>
      <AppHeader />
      <Layout>
        <Layout.Sider collapsed={isSiderCollapsed} trigger={null} className={styles.sider}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
        </Layout.Sider>
        <Layout.Content className={styles.content}>
          <DataBoundary what={APP_NAME}>
            <Outlet />
          </DataBoundary>
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

export default AppShell;
