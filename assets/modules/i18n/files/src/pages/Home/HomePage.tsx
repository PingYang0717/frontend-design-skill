import React from 'react';
import { Card, Typography } from 'antd';

import { useTranslations } from '@/i18n/useTranslations';

const HomePage: React.FC = () => {
  const t = useTranslations();

  return (
    <Card title={t.pages.home.title}>
      <Typography.Paragraph>{t.pages.home.welcome(t.app.name)}</Typography.Paragraph>
    </Card>
  );
};

export default HomePage;
