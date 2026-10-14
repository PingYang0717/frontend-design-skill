import React from 'react';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { Navigate, useLocation } from 'react-router';
import { LockOutlined, UserOutlined } from '@ant-design/icons';

import { APP_NAME } from '@/constants/app';
import { ROUTES } from '@/constants/routes';
import { useLogin } from '@/hooks/useSessionMutations';
import { selectIsAuthenticated, useSessionStore } from '@/stores/useSessionStore';
import type { LoginRequest } from '@/types/api/auth';
import { describeActionError } from '@/utils/describeError';

import styles from './LoginPage.module.css';

/** RequireAuth 以 location.state.from 帶來原本要去的網址;形狀不對就當作沒有。 */
const readReturnTo = (state: unknown): string | undefined =>
  typeof state === 'object' && state !== null && 'from' in state && typeof state.from === 'string'
    ? state.from
    : undefined;

/** 登入頁:全公司一致的畫面。認證方式不同時只換 authApi 與 DTO,這個頁面不動(docs/conventions/login.md)。
 *  表單用 antd Form:`Form.Item name` 管值與驗證,label 自動以 htmlFor 對到輸入元件(docs/conventions/components.md)。 */
const LoginPage: React.FC = () => {
  const location = useLocation();
  const isAuthenticated = useSessionStore(selectIsAuthenticated);
  const login = useLogin();

  if (isAuthenticated) {
    // 已登入(含剛登入成功):回到原本要去的頁面,沒有就回首頁。
    return <Navigate to={readReturnTo(location.state) ?? ROUTES.home} replace />;
  }

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <div className={styles.heading}>
          <Typography.Title level={3}>{APP_NAME}</Typography.Title>
          <Typography.Paragraph type="secondary">請以公司帳號登入</Typography.Paragraph>
        </div>
        {login.isError ? (
          <Alert type="error" showIcon className={styles.alert} message={describeActionError(login.error)} />
        ) : null}
        <Form<LoginRequest> layout="vertical" requiredMark={false} onFinish={(values) => login.mutate(values)}>
          <Form.Item name="username" label="帳號" rules={[{ required: true, whitespace: true, message: '請輸入帳號' }]}>
            <Input prefix={<UserOutlined />} autoComplete="username" autoFocus />
          </Form.Item>
          <Form.Item name="password" label="密碼" rules={[{ required: true, message: '請輸入密碼' }]}>
            <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={login.isPending}>
            登入
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
