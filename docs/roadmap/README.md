# roadmap — 分阶段升级路线图

> 从根目录 `upgrade-plan.md` 的 5-phase 计划拆出，按 phase 独立成档。每份 ≤ 200 行。

---

## 文件清单

| 路径 | Phase | 说明 |
|------|------|------|
| [phase-0.md](phase-0.md) | Phase 0 | 基础设施准备：pnpm workspace + 基座兼容性 + 子应用模板 + CI + 自研包分类 |
| [phase-1.md](phase-1.md) | Phase 1 | 共享层抽离：packages/shared + packages/compat |
| [phase-2.md](phase-2.md) | Phase 2 | 试点迁移 scr-web（68 .vue） |
| [phase-3.md](phase-3.md) | Phase 3 | 批量迁移 sms → cmp → cms → cos |
| [phase-4.md](phase-4.md) | Phase 4 | 基座优化 + 清理收尾 |
| [supplementary.md](supplementary.md) | 补充 | 人 vs Agent 分工 · 风险与应对 · 时间线估算 · 附录 |

---

## 与 upgrade-plan.md 的关系

- 根目录 [`../../upgrade-plan.md`](../../upgrade-plan.md) 保留作为**总览入口**（项目概况 + 整体策略 + 各 phase 一句话 + 链到本目录）
- 各 phase 详细内容在本目录下

---

## 当前执行状态（截至 2026-04-23）

- Phase 0 ✅ 完成（pnpm workspace + sms-web/cop-web 接入）
- Phase 1 ✅ 完成（packages/ 下 6 个 @ss-cmp/* 包，设计见 [archived-specs/2026-04-22-common-compat-workspace-design.md](../history/archived-specs/2026-04-22-common-compat-workspace-design.md)）
- Phase 2 ✅ 完成（scr-web 已迁，用 Vite 作为特例）
- Phase 3 ⏳ 进行中：sms-web ✅ · cmp-web/cms-web/cos-web ⬜
- Phase 4 ⬜ 待开始（所有子应用迁完后）
