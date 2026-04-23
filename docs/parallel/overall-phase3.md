# Phase 3 并行迁移细节

> 从 overall-plan.md 拆出。Phase 3 是核心并行阶段，各子应用的并行度 / 拆分方式在此。

## 子应用间：串行（一个迁完再开下一个）

```
sms-web ──→ cmp-web ──→ cms-web ──→ cos-web ──→ csc-web
 3周         5-6周       5-6周       6-8周       8-12周
```

> csc-web 已移出仓库不迁，下文保留作为"大规模并行方法论参考"。

**为什么不跨子应用并行？**
- 迁移经验和 Codemod 脚本需要逐步积累和完善
- compat 层可能在迁移过程中发现新问题需要修补
- 同时开多条战线会分散 Review 精力，质量下降

## 子应用内：高度并行

### sms-web（126 .vue，并行度 3）— ✅ 已完成（实际单 pass）

```
[串行] 创建 Vue3 工程骨架 + 迁移路由 + 迁移 store
       ↓

┌───────────────────────────────────────────────┐
│              sms-web 并行迁移                   │
│                                               │
│  Agent A          Agent B          Agent C    │
│  ─────────        ─────────        ─────────  │
│  views/模块1      views/模块2      components/ │
│  (~40 .vue)       (~40 .vue)       + common/  │
│                                    (~46 .vue)  │
│                                               │
│  每个 Agent 独立 git worktree                   │
│  共享 CLAUDE.md 约束                            │
└───────────────────────────────────────────────┘
       ↓ 合并
[人工] Review + 联调测试（~2天）
```

> 实际：sms-web 未按 3-Agent 执行，改为单 pass（commit `a0927ef`）。原方案归档在 [../history/archived-parallel-plans/sms-web.md](../history/archived-parallel-plans/sms-web.md)。

### cmp-web（521 .vue，并行度 4-5）

```
[串行] 创建 Vue3 工程骨架 + 迁移路由 + 迁移 store
       + Codemod 批量替换 cmp-element import
       ↓

┌─────────────────────────────────────────────────────────┐
│                  cmp-web 并行迁移                         │
│                                                         │
│  Agent A      Agent B      Agent C      Agent D    (E)  │
│  ─────────    ─────────    ─────────    ─────────       │
│  views/       views/       views/       views/          │
│  模块1        模块2        模块3        模块4           │
│  (~130 .vue)  (~130 .vue)  (~130 .vue)  (~130 .vue)     │
│                                                         │
│  可选 Agent E: 专门处理 components/ 公共组件               │
└─────────────────────────────────────────────────────────┘
       ↓ 分批合并（每路完成即 Review）
[人工] Review + 联调测试（~3天）
```

### cms-web（521 .vue，并行度 4-5）

```
[串行] 创建 Vue3 工程骨架 + 迁移路由 + 迁移 store
       + Codemod 批量替换（含 vue-class-component → setup、i18n 升级）
       ↓

┌─────────────────────────────────────────────────────────┐
│                  cms-web 并行迁移                         │
│                                                         │
│  Agent A      Agent B      Agent C      Agent D    (E)  │
│  ─────────    ─────────    ─────────    ─────────       │
│  views/       views/       views/       components/     │
│  模块1        模块2        模块3        + common/       │
│  (~130 .vue)  (~130 .vue)  (~130 .vue)  (~130 .vue)     │
│                                                         │
│  注意：cms-web 的 vue-class-component 装饰器改写          │
│  Codemod 已在串行阶段批量处理骨架，Agent 负责细节调整       │
└─────────────────────────────────────────────────────────┘
       ↓ 分批合并
[人工] Review + 联调测试 + i18n 多语言验证（~3天）
```

### cos-web（567 .vue，并行度 4-5）

```
[串行] 创建 Vue3 工程骨架 + 迁移路由 + 迁移 store
       + Codemod 批量替换
       + 验证 cmp-graph/graph-editor/topology 的 compat 层
       ↓

┌─────────────────────────────────────────────────────────┐
│                  cos-web 并行迁移                         │
│                                                         │
│  Agent A      Agent B      Agent C      Agent D   (E)   │
│  ─────────    ─────────    ─────────    ─────────       │
│  views/       views/       views/       views/          │
│  模块1        模块2        模块3        模块4           │
│                                                         │
│  ⚠️ 图/拓扑相关组件集中分配给一个 Agent（保持上下文一致）   │
│  ⚠️ CodeMirror/mavon-editor 相关也集中分配               │
└─────────────────────────────────────────────────────────┘
       ↓ 分批合并
[人工] Review + 联调测试 + 图/拓扑可视化回归（~4天）
```

### csc-web（1,211 .vue，并行度 6-8）— 不迁移，保留作参考

```
[串行] 创建 Vue3 工程骨架 + 迁移路由 + 迁移 store
       + Codemod 批量替换
       + 添加 Qiankun lifecycle
       ↓

┌─────────────────────────────────────────────────────────────────┐
│                      csc-web 并行迁移                             │
│                                                                 │
│  Agent A     B        C        D        E        F       (G)(H) │
│  ────────  ────────  ────────  ────────  ────────  ────────     │
│  views/    views/    views/    views/    views/    views/        │
│  bill/     cmdb/     dashboard resource  monitor  system/       │
│            +datebase           -apply/   +ops/    +components/  │
│                                                                 │
│  (~200     (~200     (~200     (~200     (~200    (~200         │
│   .vue)     .vue)     .vue)     .vue)     .vue)    .vue)        │
│                                                                 │
│  按业务模块分工，每个 Agent 拥有完整的业务上下文                       │
│  ⚠️ common/ 和 layouts/ 由一个专门的 Agent 先行处理                 │
│  ⚠️ services/ API 层统一迁移后再分发                                │
└─────────────────────────────────────────────────────────────────┘
       ↓ 分批合并（每个模块完成即 Review，不等全部完成）
[人工] Review + 分模块联调 + 全量回归（~5天）
```
