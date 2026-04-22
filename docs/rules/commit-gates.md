# 提交门禁（每次提交前必须执行）

> 硬性门禁：任何一步未通过不允许提交。

---

## 1. Lint 检查（硬性门禁，不通过不允许提交）

```bash
# 进入子应用目录后执行
npx eslint src/ --ext .ts,.vue        # 必须 0 errors
npx vue-cli-service lint --no-fix     # 或项目配置的 lint 命令

# 如有 prettier 配置
npx prettier --check src/
```

**lint 报错 → 先修复 → 再提交。不允许带 lint 错误提交。**

## 2. 代码质量审查（使用 /simplify）

每个子应用迁移完成后、提交前，必须运行 `/simplify` 审查代码质量：

```
检查项：
- 重复代码（>10 行相似逻辑 → 抽取为共享函数或 composable）
- 过大组件（>300 行 → 拆分子组件或抽取 composable）
- 未使用的导入和变量（删除）
- 硬编码的值（提取为常量）
- any 类型残留（补充具体类型）
- 空 catch 块（添加有意义的错误处理）
- 可复用逻辑（多个组件相同模式 → 抽取 useXxx）
```

## 3. 提交前完整流程

```
迁移 .vue 文件完成
  ↓
① eslint 检查通过（0 errors）
  ↓
② /simplify 代码质量审查通过
  ↓
③ 构建验证通过（vue-cli-service build）
  ↓
④ 浏览器功能验证通过
  ↓
⑤ git commit
```

**跳过任何一步都不允许提交。**

---

## 相关

- [agent-constraints.md](agent-constraints.md) — "必须/禁止" 规则总表
- [../migration/lifecycle.md](../migration/lifecycle.md) — Phase C 提交与合并详细步骤
- [../developer/pre-commit-hooks.md](../developer/pre-commit-hooks.md) — husky + lint-staged 自动拦截
