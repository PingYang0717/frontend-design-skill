import React from 'react';
import { Card, Typography } from 'antd';

import { useCurrentUser } from '@/hooks/useCurrentUser';

const HomePage: React.FC = () => {
  const user = useCurrentUser();

  return (
    <Card title="首頁">
      <Typography.Paragraph>歡迎回來,{user.name}</Typography.Paragraph>
    </Card>
  );
};

export default HomePage;
