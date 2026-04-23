# parallel — 并行迁移方案

> 用 git worktree + 多 Agent 并行迁移加速方案。sms-web 已验证，cmp-web / cms-web / cos-web 521+ .vue 规模迁移可参考。
> 决定并行度、拆分方式、审查节奏前读本区。

---

## 文件清单

| 文件 | 说明 | 何时读 |
|------|------|--------|
| [overall-plan.md](overall-plan.md) | Agent 并行总方案：各阶段并行度 / 质量保障 / 成本 / 时间线 | 决定要不要并行时 |
| [overall-phase3.md](overall-phase3.md) | Phase 3 核心并行阶段：各子应用 ASCII 图 + 并行度细节 | 决定具体子应用拆分时 |
| [overall-workflow.md](overall-workflow.md) | Git Worktree 工作流 + Agent Prompt 模板 + 激进并行 | 真正启动并行前 |
| [per-app.md](per-app.md) | 各子应用（cmp / cms / cos）并行方案总览 + 对比 + Codemod 矩阵 | 选具体子应用策略时 |
| [per-cmp-web.md](per-cmp-web.md) | cmp-web 521 .vue 5-Agent 并行详情 | 启动 cmp-web 迁移时 |
| [per-cms-web.md](per-cms-web.md) | cms-web 521 .vue 5-Agent（vue-class-component + i18n 重点） | 启动 cms-web 迁移时 |
| [per-cos-web.md](per-cos-web.md) | cos-web 567 .vue 5-Agent（图/拓扑 + @ss-cmp/cmp-graph runtime 首验） | 启动 cos-web 迁移时 |
| [auto-mode.md](auto-mode.md) | 全自动无人工 Review 并行方案 | 信任边界已建立后启用 |

### 已归档

- [sms-web.md](../history/archived-parallel-plans/sms-web.md) — sms-web 三路并行细化方案（已完成，实际单 pass 执行，archived 2026-04-23）

---

## 选择决策树

```
要并行？
├─ 子应用 <150 .vue → 串行就行，看 overall-plan 的"何时不并行"
└─ 子应用 ≥150 .vue →
   ├─ 首次实施参考 archived-parallel-plans/sms-web.md（sms-web 已完成）
   ├─ cmp/cms/cos 按 per-app.md 的拆分
   └─ 想完全无人工介入？看 auto-mode.md 风险评估
```

---

**状态说明**：Step 2 完成：4 个文件已从仓库根目录搬入（`agent-parallel-plan.md` → `overall-plan.md`，`agent-parallel-all-apps.md` → `per-app.md`，`agent-parallel-sms-web.md` → `sms-web.md`，`agent-auto-parallel.md` → `auto-mode.md`）。
