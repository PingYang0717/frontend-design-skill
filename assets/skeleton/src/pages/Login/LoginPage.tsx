import React from 'react';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { Navigate, useLocation } from 'react-router';
import { LockOutlined, UserOutlined } from '@ant-design/icons';

import { ROUTES } from '@/constants/routes';
import { useLogin } from '@/hooks/useSessionMutations';
import { useTranslations } from '@/i18n/useTranslations';
import { selectIsAuthenticated, useSessionStore } from '@/stores/useSessionStore';
import type { LoginRequest } from '@/types/api/auth';
import { describeActionError } from '@/utils/describeError';

import styles from './LoginPage.module.css';

/** RequireAuth 以 location.state.from 帶來原本要去的網址;形狀不對就當作沒有。 */
const readReturnTo = (state: unknown): string | undefined =>
  typeof state === 'object' && state !== null && 'from' in state && typeof state.from === 'string'
    ? state.from
    : undefined;

/** 登入頁:全公司一致的畫面。認證方式不同時只換 authApi 與 DTO,這個頁面不動(docs/conventions/login.md)。 */
const LoginPage: React.FC = () => {
  const location = useLocation();
  const isAuthenticated = useSessionStore(selectIsAuthenticated);
  const login = useLogin();
  const t = useTranslations();

  if (isAuthenticated) {
    // 已登入(含剛登入成功):回到原本要去的頁面,沒有就回首頁。
    return <Navigate to={readReturnTo(location.state) ?? ROUTES.home} replace />;
  }

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <div className={styles.heading}>
          <Typography.Title level={3}>{t.app.name}</Typography.Title>
          <Typography.Paragraph type="secondary">{t.pages.login.subtitle}</Typography.Paragraph>
        </div>
        {login.isError ? (
          <Alert type="error" showIcon className={styles.alert} message={describeActionError(login.error, t)} />
        ) : null}
        <Form<LoginRequest> layout="vertical" requiredMark={false} onFinish={(values) => login.mutate(values)}>
          <Form.Item
            name="username"
            label={t.pages.login.username}
            rules={[{ required: true, whitespace: true, message: t.pages.login.usernameRequired }]}
          >
            <Input prefix={<UserOutlined />} autoComplete="username" autoFocus />
          </Form.Item>
          <Form.Item
            name="password"
            label={t.pages.login.password}
            rules={[{ required: true, message: t.pages.login.passwordRequired }]}
          >
            <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={login.isPending}>
            {t.pages.login.submit}
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
