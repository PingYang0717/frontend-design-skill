import React from 'react';
import { Button, Dropdown } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useLogout } from '@/hooks/useSessionMutations';

/** header 右側的使用者選單:顯示目前使用者,提供登出。所有專案長一樣,不在各專案重做。 */
const UserMenu: React.FC = () => {
  const user = useCurrentUser();
  const logout = useLogout();

  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items: [{ key: 'logout', icon: <LogoutOutlined />, label: '登出', onClick: () => logout.mutate() }],
      }}
    >
      <Button type="text" icon={<UserOutlined />} loading={logout.isPending}>
        {user.name}
      </Button>
    </Dropdown>
  );
};

export default UserMenu;
