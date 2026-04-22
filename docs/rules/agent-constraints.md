# Agent 行为约束

> 所有执行迁移任务的 Agent 必须遵守。不可单方面绕过。

---

## 必须遵守

```
1. 迁移前先读完 CLAUDE.md + .claude/memory/ 下所有文件
2. 一次只迁移一个页面/组件，迁完立即验证
3. 不要一次性迁移整个子应用
4. 保持原有构建工具（Vue CLI），不切 Vite
5. 自研包不改源码，在应用侧做适配
6. 保持功能完全一致，不顺手"优化"业务逻辑
7. CSS 类名和结构保持一致
8. 迁完后必须在浏览器中验证功能
9. 提交前必须 eslint 0 errors + /simplify 审查通过
10. 遇到问题查阅资料后，将问题和解决方案保存到 docs/history/knowledge-base/（自动执行，无需用户提醒）
```

## 禁止

```
1. 禁止跳过类型检查（// @ts-ignore, // @ts-nocheck）
2. 禁止使用 any 类型
3. 禁止修改 shared 包的接口签名
4. 禁止在子应用中访问其他子应用的内部状态
5. 禁止删除看起来没用的代码（可能被其他子应用引用）
6. 禁止修改基座 main-web 代码
7. 禁止把 Vue CLI 构建换成 Vite
8. 禁止带 lint 错误提交代码
```

---

## 相关

- [build-tool.md](build-tool.md) — 构建工具约束详解
- [commit-gates.md](commit-gates.md) — 提交门禁
- [layered-dependencies.md](layered-dependencies.md) — 分层依赖规则
- [../migration/typescript-rules.md](../migration/typescript-rules.md) — TS 约束（包含 any 禁止）
