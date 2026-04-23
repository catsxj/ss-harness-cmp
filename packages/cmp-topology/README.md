# @ss-cmp/cmp-topology

原 `cmp-topology@1.0.0`（Vue 2 + `@antv/g6@^3.5` 关系图/树图壳）的 Vue 3 替代包。**空骨架**，Phase 4 cmp-web 迁移时填充。

保留 `@antv/g6@^3.5.12`，不升级到 G6 v4/v5（API 破坏性）。

## 源码状况

`original/cmp-topology@1.0.0/` 下**没有 `.vue` / 可读 `.js` 源码**：
- `lib/cmp-topology.common.js` 是 webpack concat 压缩输出
- 只有一个占位 `.js` 在 `original/cmp-topology/`

所以 Phase 4 填充时只能做**重新实现**（按 cmp-web 业务用法 + 原版 API 从头写），不是 A 档 port。

## Phase 4 填充清单（待定）

| 原 packages/graph/ | 模块 | 状态 |
|-------------------|------|------|
| Graph.vue | Graph（通用关系图） | ⬜ Phase 4 重新实现 |
| TreeGraph.vue | TreeGraph（树形图） | ⬜ Phase 4 重新实现 |
| config.js | 默认节点/边样式 | ⬜ Phase 4 重新实现 |
| registerDefault.js | G6 自定义节点/边注册 | ⬜ Phase 4 重新实现 |

## 外部依赖

- `@antv/g6@^3.5.12`
- `@ss-cmp/design-tokens` — workspace 设计令牌
- `vue` peerDep
