# Phase 1：共享层抽离

**目标：从 5 个子应用中提取公共代码到 shared 包**
**预计周期：1-2 周**

## 执行状态

✅ **已完成**（2026-04-22 sms-web workspace 抽取）。详细见 [../history/archived-specs/2026-04-22-common-compat-workspace-design.md](../history/archived-specs/2026-04-22-common-compat-workspace-design.md)。

实际实现的包组织与本 plan 略有差异：不是单一 `packages/shared/` + `packages/compat/`，而是**按职责拆为 6 个**：`@ss-cmp/{design-tokens, utils, cmp-element, cmp-echarts, cmp-graph, cmp-topology}`。

---

## 1.1 待提取的公共代码（计划版）

通过分析 5 个子应用，以下代码存在重复：

```
packages/shared/
├── package.json              # name: @ss-harness/shared
├── tsconfig.json
├── src/
│   ├── types/                # 公共 TS 类型
│   │   ├── api.ts            # 请求/响应类型
│   │   ├── business.ts       # 业务模型
│   │   └── index.ts
│   ├── utils/                # 工具函数（零框架依赖）
│   │   ├── format.ts
│   │   ├── validate.ts
│   │   ├── storage.ts
│   │   └── index.ts
│   ├── api/                  # axios 封装
│   │   └── request.ts        # 拦截器、token、错误处理
│   ├── constants/            # 常量
│   └── hooks/                # Vue3 Composables（仅新子应用用）
└── dist/
```

### 实际实现

拆为 `packages/utils/` + `packages/design-tokens/`：
- `@ss-cmp/utils` — auth / crypto / day / request / resolvePath / uploadFile + shims .d.ts
- `@ss-cmp/design-tokens` — SCSS 变量 + Element Plus CSS var 覆盖

## 1.2 自研包适配层（计划版的 packages/compat）

由于自研包不可升级，需要创建适配层。计划版：

```
packages/
├── shared/
└── compat/                     # 所有自研包的 Vue3 适配集中在一起
    └── src/{cmp-element,cmp-echarts,cmp-graph,cmp-socket}/
```

### 实际实现

**不是集中到 `packages/compat/`**，而是**每个自研包一个独立的 `@ss-cmp/*` 包**：
- `@ss-cmp/cmp-element` — 10 个 API-兼容重新实现 + 3 个 A 档 port
- `@ss-cmp/cmp-echarts` — 6 chart 重新实现 + enhanced useChart
- `@ss-cmp/cmp-graph` — 5 A 档 port from original .vue 源
- `@ss-cmp/cmp-topology` — 空骨架（Phase 4 填）
- `cmp-socket` — 保留原包（B 档，不抽）

选此设计的理由：独立包可各自管理 dep / 版本 / 发布，未来 npm publish 更清晰。

**核心思路**：子应用迁移时，将 `import xxx from 'cmp-element'` 替换为 `import xxx from '@ss-cmp/cmp-element'`，接口保持一致，内部实现换成 Element Plus。

## 1.3 关键原则

| 原则 | 说明 |
|------|------|
| 零框架依赖 | utils 主入口不 import vue / element-plus（vue 为 peerDep） |
| 双输出 | `.ts` + 生成的 `.d.ts`（workspace 下 ts 直接共享源码） |
| hooks 单独入口 | @ss-cmp/utils 可有 Vue 3 只用的 hooks 入口 |
| 自研包不动源码 | 所有适配工作在 @ss-cmp/* 层完成，原包零修改 |
| compat 层按需构建 | 只为 Vue3 不兼容 / 需升级的包建 @ss-cmp；验证可直接用的不建 |

## 1.4 Phase 1 验收标准

```
[x] @ss-cmp/* 包可被 sms-web（Vue3）引用
[ ] API 层有完整的请求/响应类型（shims-ajax.d.ts ✓，补齐各子应用业务类型待 Phase 4）
[ ] 工具函数有单测（待补）
[x] 无循环依赖
[x] sms-web build + 浏览器 smoke test 通过
```

> Phase 4 cmp-web 迁移时，需要验证 cmp-element / cmp-graph 3+5 个未 runtime 验证的组件（见 [../../.claude/memory/project_cmp_workspace_flow.md](../../.claude/memory/project_cmp_workspace_flow.md)）。
