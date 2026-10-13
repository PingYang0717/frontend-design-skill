import React from 'react';
import { Card, Typography } from 'antd';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useTranslations } from '@/i18n/useTranslations';

const HomePage: React.FC = () => {
  const user = useCurrentUser();
  const t = useTranslations();

  return (
    <Card title={t.pages.home.title}>
      <Typography.Paragraph>{t.pages.home.welcome(user.name)}</Typography.Paragraph>
    </Card>
  );
};

export default HomePage;
