# Pre-commit Hook 配置

> 架构约束自动化：git commit 时自动拦截 lint 错误，不依赖人记得手动跑

---

## 配置步骤

### 1. 根目录安装 husky + lint-staged

```bash
cd ss-harness-cmp
pnpm add -D -w husky lint-staged
npx husky init
```

### 2. 根 package.json 添加 lint-staged 配置

```json
{
  "lint-staged": {
    "*.{ts,vue}": [
      "eslint --fix",
      "eslint"
    ]
  }
}
```

### 3. 配置 husky pre-commit hook

```bash
# .husky/pre-commit
npx lint-staged
```

### 4. 各子应用确保 eslint 配置正确

每个子应用必须有 `.eslintrc.js` 或 `.eslintrc.cjs`，规则覆盖：
- `@typescript-eslint/no-explicit-any: error`（禁止 any）
- `no-unused-vars: error`（禁止未使用变量）
- `vue/multi-word-component-names: off`（允许单词组件名，迁移期放宽）

---

## 效果

```
git commit -m "feat: xxx"
  ↓ husky 触发
lint-staged 只检查本次 staged 的 .ts/.vue 文件
  ↓
eslint --fix（自动修复可修复的问题）
  ↓
eslint（检查剩余问题）
  ├── 0 errors → commit 成功
  └── 有 errors → commit 被阻止，提示修复
```

**不需要记得手动跑 lint，commit 时自动拦截。**

---

## 注意事项

- 迁移期间旧的 .js 文件不纳入 lint-staged（只检查 .ts 和 .vue）
- 如果某次确实需要跳过 hook（极少数情况），用 `git commit --no-verify`，但必须在 commit message 中说明原因
- 各子应用的 eslint 配置差异由子应用自己的 `.eslintrc` 控制
