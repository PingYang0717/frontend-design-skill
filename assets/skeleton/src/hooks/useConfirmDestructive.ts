import { App } from 'antd';

interface ConfirmOptions {
  title: string;
  content?: string;
  okText?: string;
  onConfirm: () => unknown;
}

/** 刪除這類無法復原的動作一律先確認。統一按鈕文案與危險樣式,不在各處自己開 Modal.confirm。 */
export const useConfirmDestructive = () => {
  const { modal } = App.useApp();

  return ({ title, content, okText, onConfirm }: ConfirmOptions) => {
    modal.confirm({
      title,
      content,
      okText: okText ?? '刪除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: onConfirm,
    });
  };
};
