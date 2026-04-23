# 各子应用 Agent 并行方案总览

> sms-web 细化方案已归档到 [../history/archived-parallel-plans/sms-web.md](../history/archived-parallel-plans/sms-web.md)（已完成）。
> 本文档覆盖：cmp-web、cms-web、cos-web（详情各自拆档）。
> csc-web 不迁移（保持 Vue 2，**已移出本仓库单独维护**，2026-04-22）。

---

## 总体节奏

```
scr-web (68)   ████ Done（试点）
sms-web (126)  ████████ Done（实际单 pass）
cmp-web (521)  ████████████████  5 Agent, ~5-6 周
cms-web (521)  ████████████████  5 Agent, ~5-6 周
cos-web (567)  ██████████████████  5 Agent, ~6-8 周
csc-web (1211) ──── 不迁移（保持 Vue 2）& 已移出本仓库
```

每个子应用内部分为：
- **Stage 1 串行前置**（主 Agent 做）：骨架 + store + router + services + Codemod
- **Stage 2 并行迁移**（子 Agent 做）：.vue 文件按目录拆分
- **Stage 3 验证**（自动 CI + 人工浏览器）

---

## 各子应用详情

| 子应用 | 详细方案 | 核心难点 | 状态 |
|--------|----------|---------|------|
| cmp-web | [per-cmp-web.md](per-cmp-web.md) | cmp-element 替换、cmp-echarts | ⬜ |
| cms-web | [per-cms-web.md](per-cms-web.md) | vue-class-component 装饰器改写、vue-i18n 9、WangEditor 5 | ⬜ |
| cos-web | [per-cos-web.md](per-cos-web.md) | cmp-graph 5 个 A 档 port runtime 首次验证、拓扑 wrapper、mavon-editor 替换 | ⬜ |

---

## 各子应用对比

| | sms-web | cmp-web | cms-web | cos-web |
|--|---------|---------|---------|---------|
| .vue 数量 | 125 | 521 | 521 | 567 |
| Agent 数 | 3 | 5 | 5 | 5 |
| Stage 1 天数 | 3 | 3 | 4 | 4 |
| Stage 2 天数 | 8-10 | 12-15 | 12-15 | 15-18 |
| Stage 3 天数 | 2 | 3 | 3 | 4 |
| 总计天数 | 13-15 | 18-21 | 19-22 | 23-26 |
| 特殊难点 | vue-grid-layout | cmp-element | class-component + i18n | 图/拓扑 3 包 |
| 先行 Agent | layouts | layouts | layouts + i18n | layouts + 图 wrapper |

> csc-web 不迁移，保持 Vue 2，已移出本仓库单独维护（2026-04-22）。Qiankun 天然支持 Vue 2 + Vue 3 子应用跨仓库 / 跨部署共存。

---

## Codemod 脚本复用矩阵

```
                      sms  cmp  cms  cos
element-ui-to-plus     ✓    ✓    ✓    ✓
cmp-element-replace    ✗    ✓    ✓    ✓
remove-this            ✓    ✓    ✓    ✓
options-to-setup       ✓    ✓    ✓    ✓
class-component-setup  ✗    ✗    ✓    ✗
vue-router-upgrade     ✓    ✓    ✓    ✓
i18n-upgrade           ✗    ✗    ✓    ✗

每完成一个子应用，Codemod 脚本会更完善，后续子应用受益。
这就是串行迁移的优势——经验编码化。
```
