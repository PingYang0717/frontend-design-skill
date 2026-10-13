// Conventional Commits:<type>(<scope>): <subject>,例如 `feat(items): 新增項目建立對話框`。
// type 清單與 scope 寫法見 docs/conventions/git-workflow.md。
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // subject 允許中文,關掉英文大小寫限制。
    'subject-case': [0],
  },
};
