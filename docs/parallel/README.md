# parallel — 并行迁移方案

> 用 git worktree + 多 Agent 并行迁移加速方案。sms-web 已验证，cmp-web / cms-web / cos-web 521+ .vue 规模迁移可参考。
> 决定并行度、拆分方式、审查节奏前读本区。

---

## 文件清单

| 文件 | 说明 | 何时读 |
|------|------|--------|
| [overall-plan.md](overall-plan.md) | Agent 并行总方案：各阶段并行度 / worktree 工作流 | 决定要不要并行时 |
| [per-app.md](per-app.md) | 各子应用（cmp / cms / cos）并行拆分方案 | 选具体子应用并行策略时 |
| [sms-web.md](sms-web.md) | sms-web 三路并行细化方案（已实施） | 要复用 sms-web 的拆分经验时 |
| [auto-mode.md](auto-mode.md) | 全自动无人工 Review 并行方案 | 信任边界已建立后启用 |

---

## 选择决策树

```
要并行？
├─ 子应用 <150 .vue → 串行就行，看 overall-plan 的"何时不并行"
└─ 子应用 ≥150 .vue →
   ├─ 首次实施参考 sms-web.md（三路并行实测）
   ├─ cmp/cms/cos 按 per-app.md 的拆分
   └─ 想完全无人工介入？看 auto-mode.md 风险评估
```

---

**状态说明**：Step 2 完成：4 个文件已从仓库根目录搬入（`agent-parallel-plan.md` → `overall-plan.md`，`agent-parallel-all-apps.md` → `per-app.md`，`agent-parallel-sms-web.md` → `sms-web.md`，`agent-auto-parallel.md` → `auto-mode.md`）。
