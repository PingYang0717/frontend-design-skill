import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router';

import { ROUTES } from '@/constants/routes';

const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="403"
      title="沒有權限"
      subTitle="你的帳號沒有存取這個頁面的權限,如有需要請聯絡系統管理員。"
      extra={<Button onClick={() => navigate(ROUTES.home)}>回首頁</Button>}
    />
  );
};

export default ForbiddenPage;
