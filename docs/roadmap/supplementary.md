# 补充：分工 · 风险 · 时间线 · 附录

从 upgrade-plan.md 拆出的 4 个横向章节。

---

## 人 vs Agent 分工

| 任务 | 谁干 | 原因 |
|------|------|------|
| pnpm workspace 搭建 | **人** | 基础设施，一次性 |
| CLAUDE.md 编写 | **人** | 需要业务理解 |
| 内部自研包兼容性评估 | **人** | 需要源码理解 |
| CI 配置 | **人** | 运维知识 |
| Codemod 脚本编写 | **Agent** | 模式化替换 |
| ElementUI → Element Plus 替换 | **Agent** | 体力活，对照表驱动 |
| Options API → Composition API | **Agent** | 结构化转换 |
| vue-class-component → setup | **Agent** | 模式化改写 |
| JS → TS 类型补全 | **Agent** | 擅长类型推断 |
| API 层类型定义 | **Agent** | 从返回值推断 |
| 路由迁移 | **人 + Agent** | 人定结构，Agent 写代码 |
| Vuex → Pinia | **人 + Agent** | 人定 store 拆分，Agent 转写 |
| 可视化组件迁移 | **人** | 需要理解业务逻辑和库 API |
| 联调 / 回归测试 | **人** | 真实环境 + 业务判断 |
| 样式调整 / UI 还原 | **人** | 视觉判断 |

---

## 风险与应对

| 风险 | 概率 | 影响 | 应对 |
|------|------|------|------|
| **cmp-element 不可升级且不兼容 Element Plus** | 确定 | 高 | 已完成：@ss-cmp/cmp-element 10 重写 + 3 A 档 port |
| **cmp-graph/topology 不可升级，Vue3 兼容性未知** | 高 | 高 | cmp-graph 5 A 档 port（未 runtime 验证）；cmp-topology Phase 4 重新实现 |
| **vue-class-component 全面改写** (cms-web) | 确定 | 中 | Codemod 脚本自动转换骨架，人工调整细节 |
| **vue-i18n 8→9 破坏性变更** (cms-web) | 确定 | 中 | API 映射表 + Agent 批量替换 |
| Element Plus 样式隔离问题 | 中 | 高 | sms-web 已验证通过 |
| scr-web / csc-web 缺 Qiankun lifecycle | 确定 | 低 | 迁移前先补加 lifecycle（scr 已完成，csc 不迁） |
| 可视化库升级导致渲染差异 | 中 | 中 | 先保持版本不变，Vue3 跑通后再升级 |
| **vue 多实例（pnpm auto-install-peers）** | 确定 | 高 | vue.config.js resolve.alias 强制单实例，见 pitfall 39 |
| 3,046 → 1,703 个 .vue 迁移（csc 移出后）周期过长 | 高 | 中 | Agent 并行 + Codemod 加速 |
| main-web 的 Element Plus beta 版本过旧 | 低 | 低 | Phase 4 统一升级到稳定版 |

---

## 时间线估算

```
Phase 0：基础设施准备                  1-2 周  ✅ Done
Phase 1：共享层抽离                    1-2 周  ✅ Done
Phase 2：试点 scr-web（68 .vue）       2-3 周  ✅ Done
Phase 3：
  ├── sms-web（126 .vue）              3 周   ✅ Done
  ├── cmp-web（521 .vue）              5-6 周  ⬜
  ├── cms-web（521 .vue）              5-6 周  ⬜
  └── cos-web（567 .vue）              6-8 周  ⬜
Phase 4：基座优化 + 清理                1-2 周
                                      ──────────
剩余总计                               17-22 周

注：
- csc-web 不迁移（Vue 2 保留，Qiankun 支持新旧共存，已移出本仓库）
- 基于 2-3 人团队 + Agent 辅助
- cmp-element 替换已在 sms-web 跑通（mold 可复用）
- cmp-graph 5 A 档 port 首次 runtime 验证在 cos-web 阶段
- Agent 并行可压缩 20-30%（约 12-16 周）
```

---

## 附录

### A. 内部自研包清单（均不可升级）

| 包名 | 版本 | 用途 | 使用者 | Vue3 方案 |
|------|------|------|--------|----------|
| cmp-socket | 1.0.0 | WebSocket 封装 | cmp, sms, csc | 直接引用或 wrapper（原包引用） |
| cmp-echarts | 2.0.0-5.6 | ECharts 封装 | cmp, sms, csc | `@ss-cmp/cmp-echarts` 重新实现 |
| cmp-element | 1.0.0-5.6 | ElementUI 二次封装 | cmp, cms, cos, csc | `@ss-cmp/cmp-element` 10 重写 + 3 A 档 port |
| cmp-graph | 1.0.0 | 图可视化 | cos, csc | `@ss-cmp/cmp-graph` 5 A 档 port |
| cmp-graph-editor | 1.0.0-5.6 | 图编辑器 | cos, csc | 无源码，Phase 4 重新实现 |
| cmp-topology | 1.0.1 | 拓扑图 | cos | `@ss-cmp/cmp-topology` 空骨架，Phase 4 重新实现 |

**约束：所有自研包源码不可修改。所有适配工作在 `packages/@ss-cmp/*` 完成。**

### B. 各子应用端口配置

| 应用 | 开发端口 | Qiankun activeRule | Qiankun lifecycle |
|------|---------|-------------------|-------------------|
| main-web | 8080 | — （基座） | — |
| cmp-web | 配置中读取 | 从 app.json 动态加载 | ✓ 已有 |
| cms-web | 配置中读取 | 从 app.json 动态加载 | ✓ 已有 |
| cos-web | 配置中读取 | 从 app.json 动态加载 | ✓ 已有 |
| csc-web | 配置中读取 | 从 app.json 动态加载 | ❌（已移出仓库） |
| scr-web | 配置中读取 | 从 app.json 动态加载 | ✓（已补加） |
| sms-web | 8085（serve 时可覆盖 8091） | 从 app.json 动态加载 | ✓ |

### C. 参考资料

- [Harness Engineering 原文](https://www.runoob.com/ai-agent/harness-engineering.html)
- [Vue 3 迁移指南](https://v3-migration.vuejs.org/)
- [Element Plus 迁移](https://element-plus.org/en-US/guide/migration.html)
- [Qiankun 官方文档](https://qiankun.umijs.org/)
- [vue-i18n 9 迁移](https://vue-i18n.intlify.dev/guide/migration/vue3.html)
- [WangEditor 5 升级](https://www.wangeditor.com/v5/migration.html)
