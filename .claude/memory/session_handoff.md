---
name: 当前工作状态交接（2026-04-23）
description: 下次进入会话时第一眼读。本会话做了什么 / 工作区是什么状态 / 下一步最该做什么 / 有哪些待办暗雷。避免重复摸索。
type: project
---

## 新会话进来，先读这份

本文件是 session handoff —— 2026-04-22/23 密集工作的收尾摘要。读完它 + CLAUDE.md 就能接着干。

---

## 已完成（最近 3 天）

### 大块工作

1. **sms-web workspace 抽取** —— `sms-web/src/common/{compat,utils}` + `validate` + `global-ui.scss` 抽到 `packages/@ss-cmp/*` 6 个包
   - design-tokens / utils / cmp-element / cmp-echarts **已浏览器验收**
   - cmp-graph 空骨架（Phase 4 填）→ **已填 5 A 档 port（未 runtime 验证）**
   - cmp-topology 空骨架（Phase 4 重新实现）
   - Phase 0-3 plan / spec 已归档：`docs/history/archived-{plans,specs}/`

2. **A 档 port 真源码组件**（用户 2026-04-22/23 请求）
   - cmp-element：CodeMirror / FullScreen / JsonView + fullScreenUtils.ts
   - cmp-graph：Editor / ContextMenu / MiniMap / Toolbar / ToolbarSimple + fonts/
   - **全部仅编译过，runtime 未跑**

3. **文档 200 行约束**（2026-04-23）
   - `docs/rules/doc-size-limit.md` 建规则
   - Stage 1-4 全拆完，所有 active .md ≤ 200 行
   - 豁免项：archived-* / plugin SKILL.md

### commit 链（origin/develop 已同步到 `8194c90`）

```
8194c90 docs: Stage 4 拆分 migration-notes/{sms,scr}-web.md
91e8536 docs: Stage 2 拆分 upgrade-plan.md + docs/parallel/ 大文件
004c4d6 docs: Stage 3 归档已执行的 plan / spec
c7f1c60 docs: 引入 200 行文档大小约束 + 拆分 pitfalls.md
91ef70e docs: record packages/ layout + workspace flow + follow-up unverified
64739ac feat(workspace): A 档 port original/cmp-element + original/cmp-graph
a0927ef merge: sms-web workspace extraction (Phase 0-3)
```

回滚 tag：`before-workspace` @ `05822f0`（已推 origin）

---

## 当前状态

- **分支**：develop（与 origin/develop 同步）
- **工作树**：干净，无未提交改动
- **chore/introduce-workspace 分支**：已 merge 进 develop，可选删除（`git branch -d chore/introduce-workspace`）
- **tag `before-workspace`**：保留，远端备份

---

## 下次最优先做什么（3 选 1）

### ~~(A) 8 个 A 档 port runtime 验证~~ ✅ 已完成（2026-04-24） — 通过 sms-web /dev/compat-smoke-test 逐块启用验收。@antv/g6-editor@1.2.0 与 Vue 3 实测兼容，canvas 正常起。cos-web 迁移时 cmp-graph 保持 A 档。

### (A-历史说明) 验证 8 个 A 档 port 的 runtime 正确性（保留作为历史记录）

**为什么**：这 8 个组件被 commit 但完全没跑过。Phase 4 cmp-web 启动后才发现挂了，**迭代成本高**。现在在 sms-web 里临时塞一页 smoke test，30-60 分钟能暴露所有问题。

**具体动作**：
1. 在 sms-web 里新建一个仅内部路由的测试页 `/sms-web/dev/compat-smoke-test`
2. import 并渲染：`CodeMirror` / `FullScreen` / `JsonView` / `cmp-graph.Editor` / `MiniMap` / `Toolbar`
3. 在浏览器打开该路由，看控制台有无报错
4. 已知风险：见 `.claude/memory/project_cmp_workspace_flow.md` "Phase 4 启动前必须先跑 smoke test 的组件" 章节
   - iconfont 路径大概率需要调整
   - `@antv/g6-editor@^1.2.0` 与 Vue 3 reactivity 兼容性未知

### (B) 启动 cmp-web 迁移（Phase 4 的 cmp-web） ⭐ 现在的推荐项

**前置（绝对不能跳）**：
1. 读 `.claude/memory/project_cmp_workspace_flow.md`（未验证清单章节）
2. 读 `docs/parallel/per-cmp-web.md`（拆分方案）
3. cmp-web 的 `vue.config.js` 必须加 vue / element-plus / @element-plus/icons-vue 三条 alias（见 pitfall 39）

### (C) 收尾小活

- 删本地 `chore/introduce-workspace` 分支（已 merged）
- 把 sms-web 60+ 处 `utils/*` 别名 import 逐步直连 `@ss-cmp/utils`，完后删 `sms-web/src/common/utils/{auth,crypto,day,request,resolvePath,uploadFile}.ts` 6 个 stub

---

## 会话中的已知暗雷 / 待办

| # | 项 | 位置 | 谁会碰到 |
|---|----|------|----------|
| 1 | 8 个 A 档 port runtime 未验证 | `packages/cmp-element` + `packages/cmp-graph` | Phase 4 cmp-web / cos-web 迁移时 |
| 2 | iconfont scoped-style 路径解析风险 | `packages/cmp-graph/src/Editor.vue` | cmp-graph 首次 runtime 用时 |
| 3 | `@antv/g6-editor@^1.2.0` 与 Vue 3 兼容性未知 | `packages/cmp-graph/src/Editor.vue` | cos-web 迁移时 |
| 4 | sms-web utils stub 层是过渡兼容 | `sms-web/src/common/utils/*.ts` | 所有子应用迁完后收尾 |
| 5 | BasicFormItem 的 `import rules from '@/validate'` eslint 重名 bug 在 Phase 2 commit (`5278359`) 中**顺便修了**（rules→validationPresets） | `packages/cmp-element/src/BasicFormItem.vue` | 已处理，此处只记录 |
| 6 | main-web/public/config/app.json 修改要 F5 基座才能生效 | main-web 启动时只读一次 | 回滚演练 / 切 entry 时 |

---

## 非项目工作（与下次无关）

- 帮用户分析过一张游戏好友列表截图（`E:\fund\11.png`，与项目无关）
- 帮用户诊断过 `claude.exe` npm 平台包缺失问题（当前会话持有 PID 16172 锁，未完全修好。用户后续想新开 claude 实例，建议走 `npx @anthropic-ai/claude-code@latest`）

---

## 如果接下来是完全不同的话题

本项目的"升级总控"入口始终是：
1. CLAUDE.md（身份 + 状态 + 必读次序）
2. `.claude/memory/project_cmp_harness.md`（项目概况）
3. 本文件（最新进度 + 下步）
