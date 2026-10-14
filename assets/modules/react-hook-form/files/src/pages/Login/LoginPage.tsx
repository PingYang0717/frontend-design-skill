import React from 'react';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation } from 'react-router';
import { LockOutlined, UserOutlined } from '@ant-design/icons';

import FormField from '@/components/common/FormField';
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

/** 登入頁:全公司一致的畫面。認證方式不同時只換 authApi 與 DTO,這個頁面不動(docs/conventions/login.md)。 */
const LoginPage: React.FC = () => {
  const location = useLocation();
  const isAuthenticated = useSessionStore(selectIsAuthenticated);
  const login = useLogin();
  const { control, handleSubmit } = useForm<LoginRequest>({ defaultValues: { username: '', password: '' } });

  const submit = handleSubmit((values) => login.mutate(values));

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
        <Form layout="vertical" requiredMark={false} onFinish={() => void submit()}>
          <FormField
            control={control}
            name="username"
            label="帳號"
            rules={{
              required: '請輸入帳號',
              validate: (value) => value.trim() !== '' || '請輸入帳號',
            }}
          >
            {(field) => <Input {...field} prefix={<UserOutlined />} autoComplete="username" autoFocus />}
          </FormField>
          <FormField control={control} name="password" label="密碼" rules={{ required: '請輸入密碼' }}>
            {(field) => <Input.Password {...field} prefix={<LockOutlined />} autoComplete="current-password" />}
          </FormField>
          <Button type="primary" htmlType="submit" block loading={login.isPending}>
            登入
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
