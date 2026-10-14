import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router';

import { ROUTES } from '@/constants/routes';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="找不到頁面"
      subTitle="這個網址不存在,請確認連結是否正確。"
      extra={<Button onClick={() => navigate(ROUTES.home)}>回首頁</Button>}
    />
  );
};

export default NotFoundPage;
