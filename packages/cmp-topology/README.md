# @ss-cmp/cmp-topology

原 `cmp-topology@1.0.0` 的 Vue 3 升级（A 档）。保持 `@antv/g6@^3.5`，不升级到 G6 v4/v5。

## 对齐清单

| 原 packages/graph/ | 模块 | 状态 |
|-------------------|------|------|
| Graph.vue | Graph（通用关系图） | ⬜ Phase 4 |
| TreeGraph.vue | TreeGraph（树形图） | ⬜ Phase 4 |
| config.js | 默认节点/边样式 | ⬜ Phase 4 |
| registerDefault.js | G6 自定义节点/边注册 | ⬜ Phase 4 |

Ground truth: `original/cmp-topology/lib/cmp-topology.common.js`（webpack concat 反编译）。
