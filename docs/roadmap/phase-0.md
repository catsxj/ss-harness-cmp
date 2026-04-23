# Phase 0：基础设施准备

**目标：搭建 monorepo + 验证 Vue3 子应用能在现有基座中运行**
**预计周期：1-2 周**

## 执行状态

✅ **已完成**（2026-04-22/23）。workspace 搭建见根 `pnpm-workspace.yaml` / `package.json` / `.npmrc`；本文档作为参考。

---

## 0.1 搭建 pnpm workspace

目标结构：

```
ss-harness-cmp/
├── pnpm-workspace.yaml
├── package.json              # 根配置
├── .npmrc
├── main-web/                 # 基座（Vue 3，已完成）
├── cmp-web/ cms-web/ cos-web/ cop-web/ scr-web/ sms-web/
└── packages/                 # 公共包（@ss-cmp/*）
```

实际配置见仓库根的：
- [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml) — 列出 8 个 workspace members
- [`package.json`](../../package.json) — `packageManager: "pnpm@10.14.0"` + 脚本 `dev:sms` / `build:sms` / `lint:sms`
- [`.npmrc`](../../.npmrc) — `shared-workspace-lockfile=false` + `auto-install-peers=true`

> ⚠️ `auto-install-peers=true` 会让 peerDep 被装成独立副本 → vue 多实例。子应用 vue.config.js 必须加 resolve.alias 强制单实例。见 pitfall 39。

## 0.2 确认现有基座对 Vue3 子应用的兼容性

基座 main-web 已经是 Vue 3 + Qiankun 2.4.6，验证清单：

```
[ ] main-web 的 registerMicroApps 在 src/core/register.ts 中
    - 通过 getMicroApp() 从 /config/app.json 动态加载
    - 默认 proxy: ${protocol}//${hostname}:60003/
    - 确认能注册 Vite 构建的 Vue3 子应用
[ ] start({ prefetch: 'all' }) 与 Vite 子应用兼容
[ ] initGlobalState + actions.init 通信链路在 Vue3 子应用中可用
[ ] experimentalStyleIsolation 对 Element Plus 子应用样式隔离验证
[ ] main-web 的 Ant Design Vue 与子应用 Element Plus 无样式冲突
```

## 0.3 创建 Vue3 子应用模板

基于现有子应用的 Qiankun lifecycle 模式创建模板：

```typescript
// 子应用 main.ts 模板（匹配现有基座的 props 协议）
import { createApp } from 'vue'
import type { App as VueApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import AppComponent from './App.vue'
import router from './router'

let app: VueApp | null = null

function render(props: Record<string, unknown> = {}) {
  const { container } = props
  app = createApp(AppComponent)
  app.use(createPinia())
  app.use(router)
  app.use(ElementPlus)

  const mountEl = container
    ? (container as Element).querySelector('#app')
    : document.querySelector('#app')
  app.mount(mountEl as Element)
}

export async function bootstrap() {}
export async function mount(props: Record<string, unknown>) { render(props) }
export async function unmount() { app?.unmount(); app = null }

// 独立运行模式
if (!(window as any).__POWERED_BY_QIANKUN__) { render() }
```

**关键：必须匹配基座传递的 props（appPath、mainRouter、container），以及 actions.init 通信模式。**

真实范本见 [`sms-web/src/main.ts`](../../sms-web/src/main.ts)。

## 0.4 建立 CI 门禁

```yaml
checks:
  - name: 类型检查
    command: vue-tsc --noEmit
    blocking: true
  - name: ESLint
    command: eslint src/ --ext .ts,.vue
    blocking: true
  - name: 构建
    command: vite build  # 或 vue-cli-service build
    blocking: true
```

## 0.5 处理内部自研包（不可升级）

**重要约束：以下自研包均不可升级源码，只能在子应用侧做适配。**

| 包名 | 版本 | 使用的子应用 | Vue3 兼容 | 处理方案 |
|------|------|-------------|----------|---------|
| cmp-socket | 1.0.0 | cmp, sms, csc | 待验证 | 方案 A：无 Vue 依赖直接用；方案 B：写 wrapper |
| cmp-echarts | 2.0.0-5.6 | cmp, sms, csc | ⚠️ 源码无 `.vue` | **重新实现**（lib 压缩，无源） |
| cmp-element | 1.0.0-5.6 | cmp, cms, cos, csc | ❌ 不兼容 | **重新实现 + 3 个 A 档 port**（见 @ss-cmp/cmp-element） |
| cmp-graph | 1.0.0 | cos, csc | ⚠️ | **5 个 A 档 port**（有完整 `.vue` 源） |
| cmp-graph-editor | 1.0.0-5.6 | cos, csc | 无源 | 待 Phase 4 处理 |
| cmp-topology | 1.0.1 | cos | 无源 | 空骨架，Phase 4 重新实现 |

### cmp-element 专项方案（核心难点）

cmp-element 是 ElementUI 的二次封装，基于 Vue 2 + ElementUI 2.x。**无法在 Vue 3 + Element Plus 环境中直接使用**，且不可升级源码。

| 方案 | 做法 | 工作量 | 风险 |
|------|------|--------|------|
| **A. 写 Element Plus 替代层** | 分析 cmp-element 暴露的所有组件 API，用 Element Plus 重新实现同名组件 | 高 | 中 |
| **B. 直接替换为 Element Plus** | 不保留 cmp-element 封装，逐处替换 | 极高 | 低 |
| **C. 子应用内嵌 Vue2 微组件** | iframe / Web Components 嵌入 | 中 | 高 |

**实际选择：方案 A**（2026-04-22 sms-web Phase D 完成）—— 10 个重新实现组件 + 3 个 A 档 port（CodeMirror / FullScreen / JsonView）；详见 `@ss-cmp/cmp-element` 包 README。

### 其他自研包 Vue3 验证流程

```
Step 1: 在 Vue3 模板子应用中 npm install 该包
Step 2: import 并尝试使用
Step 3: 按结果分类：
  - ✅ 直接可用 → 无需处理
  - ⚠️ 部分可用 → 写 Vue3 wrapper / adapter
  - ❌ 完全不可用 → 写替代组件（不改原包）
```

## 0.6 Phase 0 验收标准

```
[x] pnpm workspace 搭建完成，所有应用可通过 pnpm --filter 启动
[x] Vue3 模板子应用能在现有基座 main-web 中正常加载/卸载（sms-web 已验证）
[x] 路由切换正常（基座 ↔ 子应用）
[x] 全局状态通信正常（actions.init 模式）
[x] Element Plus 在沙箱下样式正常
[ ] CI 门禁配置完成（待实施）
[x] 6 个自研包 Vue3 兼容性分类完成
[x] cmp-element 组件清单 + Element Plus 映射完成（10 重写 + 3 A 档 port）
[ ] cmp-element Codemod 替换脚本（sms-web 手动迁移，后续 cmp-web 时再评估是否写 codemod）
[x] CLAUDE.md 更新为实际项目约束

pitfall 记录：
- 39: vue 多实例（auto-install-peers）→ 单实例 alias
- 40: SCSS @use + additionalData 冲突
- 41: shims-ajax.d.ts 不跨包
```
