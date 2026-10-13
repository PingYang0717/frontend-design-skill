import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router';

import { ROUTES } from '@/constants/routes';
import { useTranslations } from '@/i18n/useTranslations';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const t = useTranslations();

  return (
    <Result
      status="404"
      title={t.pages.notFound.title}
      subTitle={t.pages.notFound.description}
      extra={<Button onClick={() => navigate(ROUTES.home)}>{t.common.backHome}</Button>}
    />
  );
};

export default NotFoundPage;
