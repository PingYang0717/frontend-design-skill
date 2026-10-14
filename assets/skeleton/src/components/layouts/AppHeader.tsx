import React from 'react';
import { Layout, Space, Typography } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

import IconButton from '@/components/common/IconButton';
import { APP_NAME } from '@/constants/app';
import { useLayoutStore } from '@/stores/useLayoutStore';
import UserMenu from './UserMenu';

import styles from './AppShell.module.css';

const AppHeader: React.FC = () => {
  const isSiderCollapsed = useLayoutStore((state) => state.isSiderCollapsed);
  const setSiderCollapsed = useLayoutStore((state) => state.setSiderCollapsed);

  return (
    <Layout.Header className={styles.header}>
      <Space>
        <IconButton
          icon={isSiderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          label="收合或展開側欄"
          onClick={() => setSiderCollapsed(!isSiderCollapsed)}
        />
        <Typography.Text strong>{APP_NAME}</Typography.Text>
      </Space>
      <Space>
        <UserMenu />
      </Space>
    </Layout.Header>
  );
};

export default AppHeader;
