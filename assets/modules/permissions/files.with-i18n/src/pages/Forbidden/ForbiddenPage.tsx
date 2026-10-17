import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router';

import { ROUTES } from '@/constants/routes';
import { useTranslations } from '@/i18n/useTranslations';

const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const t = useTranslations();

  return (
    <Result
      status="403"
      title={t.pages.forbidden.title}
      subTitle={t.pages.forbidden.description}
      extra={<Button onClick={() => navigate(ROUTES.home)}>{t.common.backHome}</Button>}
    />
  );
};

export default ForbiddenPage;
