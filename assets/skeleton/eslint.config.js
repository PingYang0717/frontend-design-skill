import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import typescriptEslintParser from '@typescript-eslint/parser';

// oxlint 與 ESLint 並存,`npm run lint` 依序跑兩個。
//
// oxlint 是快速的第一關:correctness 規則與 `no-explicit-any`(.oxlintrc.json)。
// ESLint 只負責 oxlint 沒有對等能力的三件事:
//   1. import 自動排序(simple-import-sort)
//   2. react-hooks 與 React Compiler 的規則(react-hooks recommended)
//   3. 架構分層規則(no-restricted-imports,見下方 LAYER_RULES)
// 分工理由見 docs/conventions/tooling.md。

/** 跨資料夾一律走 `@/`;同資料夾才用 `./`。禁止 `../` 讓下方的分層規則無法被相對路徑繞過。 */
const NO_PARENT_RELATIVE = {
  group: ['../*', '../**'],
  message: '跨資料夾請用 `@/` 路徑;同資料夾才用 `./`(docs/conventions/project-structure.md)。',
};

/** 分層規則不套用在測試:測試需要跨層組裝。 */
const TEST_FILES = ['src/**/*.test.ts', 'src/**/*.test.tsx'];

/** 各層「不准 import 什麼」。依賴方向:pages → components → hooks → api → types/utils/constants。 */
const LAYER_RULES = [
  {
    files: ['src/app/**'],
    patterns: [],
  },
  {
    files: ['src/i18n/**', 'src/theme/**'],
    patterns: [
      {
        group: ['@/api/*', '@/hooks/*', '@/components/*', '@/pages/*', '@/app/*'],
        message: 'i18n 與 theme 只依賴 stores、types、constants。',
      },
    ],
  },
  {
    files: ['src/components/**', 'src/pages/**'],
    patterns: [
      {
        group: ['@/api/*', '!@/api/apiError'],
        message: '元件與頁面不直接呼叫 API;透過 `@/hooks` 的資料 hook(docs/conventions/data-fetching.md)。',
      },
    ],
    paths: [{ name: 'axios', message: 'HTTP 一律走 `@/api` 的 apiClient,再由 hook 提供給元件。' }],
  },
  {
    files: ['src/hooks/**'],
    patterns: [{ group: ['@/components/*', '@/pages/*', '@/app/*'], message: 'hooks 不依賴 UI 層。' }],
    paths: [{ name: 'axios', message: 'HTTP 一律走 `@/api` 的 apiClient。' }],
  },
  {
    files: ['src/stores/**'],
    patterns: [
      {
        group: ['@/api/*', '@/hooks/*', '@/components/*', '@/pages/*'],
        message: 'Zustand 只放 UI 狀態;伺服器資料一律用 TanStack Query(docs/conventions/state-management.md)。',
      },
    ],
  },
  {
    files: ['src/api/**', 'src/utils/**', 'src/types/**', 'src/constants/**'],
    patterns: [
      {
        group: ['@/hooks/*', '@/stores/*', '@/components/*', '@/pages/*', '@/app/*'],
        message: 'api / utils / types / constants 是底層,不可反向依賴 hooks、stores 或 UI。',
      },
    ],
  },
];

export default [
  { ignores: ['dist', 'coverage', 'node_modules'] },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // react-hooks recommended(含 React Compiler 規則)全部降為 warn:用鍵映射,升級後新增的規則自動跟著降級。
      ...Object.fromEntries(Object.keys(reactHooks.configs.recommended.rules).map((rule) => [rule, 'warn'])),
      // rules-of-hooks 交給 oxlint 報 error,這裡關掉避免同一個問題出現兩次。
      'react-hooks/rules-of-hooks': 'off',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // react 與外部套件
            ['^react$', '^[a-z]', '^@[^/]'],
            // 專案內部:@/ 與同資料夾
            ['^@/', '^\\./'],
            // 樣式
            ['^.+\\.s?css$'],
            // 純副作用 import
            ['^\\u0000'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'no-restricted-imports': ['error', { patterns: [NO_PARENT_RELATIVE] }],
    },
  },
  // 分層規則:每個區塊都要帶上 NO_PARENT_RELATIVE,因為後出現的 no-restricted-imports 設定會整條覆蓋前面的。
  ...LAYER_RULES.map(({ files, patterns, paths = [] }) => ({
    files,
    ignores: TEST_FILES,
    rules: {
      'no-restricted-imports': ['error', { paths, patterns: [NO_PARENT_RELATIVE, ...patterns] }],
    },
  })),
];
