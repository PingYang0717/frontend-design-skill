import React from 'react';
import { Layout, Select, Space, Typography } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

import IconButton from '@/components/common/IconButton';
import { LANGUAGE_LABELS } from '@/i18n/languages';
import { useTranslations } from '@/i18n/useTranslations';
import { LANGUAGES, useLanguageStore } from '@/stores/useLanguageStore';
import { useLayoutStore } from '@/stores/useLayoutStore';
import UserMenu from './UserMenu';

import styles from './AppShell.module.css';

const LANGUAGE_OPTIONS = LANGUAGES.map((value) => ({ value, label: LANGUAGE_LABELS[value] }));

const AppHeader: React.FC = () => {
  const isSiderCollapsed = useLayoutStore((state) => state.isSiderCollapsed);
  const setSiderCollapsed = useLayoutStore((state) => state.setSiderCollapsed);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const t = useTranslations();

  return (
    <Layout.Header className={styles.header}>
      <Space>
        <IconButton
          icon={isSiderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          label={t.nav.toggleSider}
          onClick={() => setSiderCollapsed(!isSiderCollapsed)}
        />
        <Typography.Text strong>{t.app.name}</Typography.Text>
      </Space>
      <Space>
        <Select
          aria-label={t.header.language}
          value={language}
          onChange={setLanguage}
          options={LANGUAGE_OPTIONS}
          popupMatchSelectWidth={false}
        />
        <UserMenu />
      </Space>
    </Layout.Header>
  );
};

export default AppHeader;
