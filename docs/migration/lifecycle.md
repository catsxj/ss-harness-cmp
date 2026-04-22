# 单个子应用迁移完整生命周期

> Phase A → B → C → D 四阶段。每迁完一个子应用，Phase D 的 7 步必须全部完成后再开始下一个。

---

## Phase A：迁移前准备

```
[ ] 1. 读完 CLAUDE.md + .claude/memory/ 下所有文件
[ ] 2. 读完 docs/history/migration-notes/ 中已完成子应用的踩坑记录
[ ] 3. 确认浏览器兼容性（docs/operations/browser-compatibility.md）
[ ] 4. 给旧版本打 tag：git tag v2-{app-name}
[ ] 5. 从 develop 切出分支：git checkout -b feature/migrate-{app-name}
[ ] 6. 记录迁移前的性能基线（docs/operations/performance-baseline.md）
```

## Phase B：执行迁移

```
按 .claude/skills/vue2-to-vue3-migration/SKILL.md 的 5 个 Stage 执行：
  Stage 1: 串行基础层（main.ts / store / router / utils / services）
  Stage 2: 并行迁移 .vue 文件
  Stage 3: Lint + /simplify 代码质量审查
  Stage 4: 构建验证（vue-cli-service build）
  Stage 5: 浏览器功能验证
```

## Phase C：提交与合并

```
[ ] 1. eslint 0 errors
[ ] 2. /simplify 审查通过
[ ] 3. 构建通过
[ ] 4. 浏览器验证通过
[ ] 5. git commit（feature 分支）
[ ] 6. git checkout develop && git merge feature/migrate-{app-name} --no-ff
[ ] 7. git push origin develop
```

## Phase D：迁移后收尾

```
[ ] 1. 更新 CLAUDE.md 的"迁移顺序与状态"（⬜ → ✅）+ .claude/memory/project_cmp_harness.md
[ ] 2. 在 docs/history/migration-notes/{app-name}.md 写迁移总结
[ ] 3. 更新 docs/developer/tech-debt-tracking.md 的技术债记录表
[ ] 4. 记录迁移后的性能数据（docs/operations/performance-baseline.md）
[ ] 5. 跑 Vue 2 + Vue 3 新旧共存联调测试（docs/operations/coexistence-testing.md）
[ ] 6. 将新踩坑记录补充到 docs/history/failure-cases.md + .claude/memory/project_cmp_pitfalls.md
[ ] 7. 确认回滚方案就绪（docs/operations/rollback.md）+ 跑回滚演练
```

**每迁完一个子应用，Phase D 的 7 步必须全部完成后再开始下一个子应用。**

---

## 相关

- [../rules/agent-constraints.md](../rules/agent-constraints.md) — 行为约束
- [../rules/commit-gates.md](../rules/commit-gates.md) — 提交门禁
- [../parallel/overall-plan.md](../parallel/overall-plan.md) — 要并行加速时的分工
