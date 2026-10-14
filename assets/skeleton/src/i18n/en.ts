import type { Translations } from './zhTW';

/** 英文字典。型別由 zhTW 推導:少一條或多一條都會編譯失敗。 */
export const en: Translations = {
  app: {
    name: 'App name',
  },
  nav: {
    home: 'Home',
    items: 'Items',
    toggleSider: 'Collapse or expand the sidebar',
  },
  common: {
    loading: (what) => `Loading ${what}…`,
    retry: 'Retry',
    cancel: 'Cancel',
    confirm: 'OK',
    create: 'Create',
    delete: 'Delete',
    search: 'Search',
    actions: 'Actions',
    backHome: 'Back to home',
  },
  header: {
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    language: 'Language',
    logout: 'Sign out',
  },
  errors: {
    offline: 'Cannot reach the server',
    offlineDetail: 'Check your network or the service status, then retry.',
    notFound: (what) => `This ${what} could not be found. It may have been deleted.`,
    forbidden: (what) => `You do not have permission to view this ${what}.`,
    loadFailed: (what) => `Failed to load ${what}`,
    loadFailedDetail: 'Please retry later. If it keeps happening, contact your administrator.',
    actionFailed: 'The action failed. Please try again later.',
    actionFailedWithStatus: (status) => `The action failed (HTTP ${status}). Please try again later.`,
    technicalDetail: 'Technical details',
    byCode: {
      VALIDATION_FAILED: 'Some of the data is invalid. Please check and submit again.',
      CONFLICT: 'Someone else changed this data. Refresh and try again.',
      INVALID_CREDENTIALS: 'The username or password is incorrect.',
    },
  },
  pages: {
    login: {
      subtitle: 'Sign in with your company account',
      username: 'Username',
      password: 'Password',
      usernameRequired: 'Please enter your username',
      passwordRequired: 'Please enter your password',
      submit: 'Sign in',
    },
    home: {
      title: 'Home',
      welcome: (name) => `Welcome back, ${name}`,
    },
    forbidden: {
      title: 'Access denied',
      description: 'Your account cannot access this page. Contact your administrator if you need access.',
    },
    notFound: {
      title: 'Page not found',
      description: 'This address does not exist. Please check the link.',
    },
  },
  items: {
    title: 'Items',
    entity: 'item',
    searchPlaceholder: 'Search by name',
    empty: 'No items yet',
    columns: {
      name: 'Name',
      status: 'Status',
      updatedAt: 'Updated',
    },
    status: {
      ACTIVE: 'Active',
      ARCHIVED: 'Archived',
    },
    create: {
      title: 'New item',
      nameLabel: 'Name',
      nameRequired: 'Please enter a name',
      success: 'Item created',
    },
    delete: {
      label: (name) => `Delete ${name}`,
      confirmTitle: (name) => `Delete "${name}"?`,
      confirmContent: 'This cannot be undone.',
      success: 'Item deleted',
    },
  },
};
