import React, { type ReactNode } from 'react';
import { Button, type ButtonProps, Tooltip } from 'antd';

interface IconButtonProps extends Omit<ButtonProps, 'icon' | 'children' | 'aria-label'> {
  icon: ReactNode;
  /** 同時當 Tooltip 與 aria-label:純圖示按鈕一定要有可讀的名稱。 */
  label: string;
}

/** 純圖示按鈕一律用它,不要自己組 Button + Tooltip。 */
const IconButton: React.FC<IconButtonProps> = ({ icon, label, ...buttonProps }) => (
  <Tooltip title={label}>
    <Button type="text" {...buttonProps} icon={icon} aria-label={label} />
  </Tooltip>
);

export default IconButton;
