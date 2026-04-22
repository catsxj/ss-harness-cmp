---
name: CMP Harness 升级项目
description: Vue2+ElementUI 微前端升级到 Vue3+Element Plus+TS 的大型项目，7 个应用，3046 个 .vue 文件
type: project
originSessionId: 6e5c9226-b555-4494-a1c0-f8f45eaff248
---
## 项目信息
- 仓库：github.com/catsxj/ss-harness-cmp
- 本地路径：D:\harnes-test\ss-harness-cmp
- 分支策略：main（基线）→ develop（迁移主分支）→ feature/* 切出迁移

## 应用清单
| 应用 | Vue版本 | .vue数 | 状态 |
|------|---------|--------|------|
| main-web | Vue 3 ✓ | 32 | 已完成，不需迁移 |
| scr-web | Vue 2 | 68 | 待迁移（试点） |
| sms-web | Vue 3 ✓ | 125 | ✅ 已完成（已合入 develop @ b057cff；build + 基座 Qiankun 挂载 + compat 层；浏览器验收待跑 coexistence-testing）|
| cmp-web | Vue 2 | 521 | 待迁移 |
| cms-web | Vue 2 | 521 | 待迁移 |
| cos-web | Vue 2 | 567 | 待迁移 |
| csc-web | Vue 2 | 1,211 | **不迁移**，保持 Vue 2；**已移出本仓库单独维护**（2026-04-22） |

## 关键约束
- 自研包（cmp-element/cmp-echarts/cmp-socket/cmp-graph/cmp-graph-editor/cmp-topology）**不可升级源码**
- cmp-element 基于 ElementUI，与 Element Plus 不兼容，需在 compat 层重新实现
- scr-web 缺少 Qiankun lifecycle，需先补加（csc-web 已移出，本仓库不涉及）
- 迁移完成标准 = 浏览器中所有功能正常运行，不只是编译通过
- **sms-web 已通过 pnpm workspace 引用 `@ss-cmp/*` 公共包**（2026-04-22，packages/ 下 4 个包就绪：design-tokens / utils / cmp-element / cmp-echarts；cmp-topology / cmp-graph 空骨架留给 Phase 4 cmp-web 迁移期填充）
- **pnpm workspace peerDep 陷阱**：`.npmrc` `auto-install-peers=true` 会把 peerDep 装成独立副本，导致 vue 多实例 → `<slot>` 跨包 `ComponentInternalInstance` 失配（null.ce 崩溃）。vue.config.js 必须用 `resolve.alias` 强制 `vue/element-plus/@element-plus/icons-vue` 指到主子应用的 `node_modules/*` 单实例

## 迁移顺序
scr-web → sms-web → cmp-web → cms-web → cos-web（csc-web 不迁移）
