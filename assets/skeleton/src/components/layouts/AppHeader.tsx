import React from 'react';
import { Layout, Space, Typography } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

import IconButton from '@/components/common/IconButton';
import { APP_NAME } from '@/constants/app';
import { useLayoutStore } from '@/stores/useLayoutStore';

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
      <Space>{/* 右側工具列:語言切換(i18n)、主題切換(dark-mode)、使用者資訊(access.md 第 5 節)依序放這裡。 */}</Space>
    </Layout.Header>
  );
};

export default AppHeader;
