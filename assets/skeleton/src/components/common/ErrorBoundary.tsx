import React, { type ErrorInfo, type ReactNode } from 'react';

import LoadErrorPanel from './LoadErrorPanel';

interface ErrorBoundaryProps {
  children: ReactNode;
  what: string;
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  error: unknown;
}

/** 唯一允許的 class component:React 沒有 componentDidCatch 的 hook 對等物。 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError = (error: unknown): ErrorBoundaryState => ({ error });

  componentDidCatch = (error: unknown, info: ErrorInfo) => {
    // 只記名稱與訊息:AxiosError 帶著整個 request 物件,直接印會很吵,在 jsdom 下還會讓 console 本身出錯。
    const summary = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.error(summary, info.componentStack);
  };

  private retry = () => {
    this.props.onRetry?.();
    this.setState({ error: null });
  };

  render = () => {
    if (this.state.error !== null) {
      return <LoadErrorPanel error={this.state.error} what={this.props.what} onRetry={this.retry} />;
    }
    return this.props.children;
  };
}

export default ErrorBoundary;
