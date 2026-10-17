import React from 'react';
import { Card, Typography } from 'antd';

import { APP_NAME } from '@/constants/app';

const HomePage: React.FC = () => (
  <Card title="首頁">
    <Typography.Paragraph>歡迎使用{APP_NAME}。</Typography.Paragraph>
  </Card>
);

export default HomePage;
