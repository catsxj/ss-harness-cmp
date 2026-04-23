---
name: CMP workspace 抽取期踩坑
description: 2026-04-22/23 sms-web compat/utils 抽到 packages/@ss-cmp/* 时遇到的问题 + 解决方式。后续 sub-app 接入 workspace 公共包时必读。
type: project
---

## 39. pnpm `auto-install-peers=true` + workspace peerDep → Vue 多实例

- 症状：`BasicFormItem.vue` 的 `<slot>` 渲染时报 `TypeError: Cannot read properties of null (reading 'ce')`
- 根因：`.npmrc` 的 `auto-install-peers=true` 让 `packages/cmp-element/package.json` 里的 `peerDependencies.vue` 被装成独立副本（`packages/cmp-element/node_modules/.pnpm/vue@3.5.32/node_modules/vue`），和 sms-web 的 `vue@3.5.32_typescript@5.4.5` 是两个物理路径 → 两个 Vue runtime → `ComponentInternalInstance` 符号不共享 → 跨包 `<slot>` 拿 null instance
- 修复：`sms-web/vue.config.js` 的 `resolve.alias` 加 `vue$ / element-plus$ / @element-plus/icons-vue$` 全部指向 `node_modules/*`（sms-web 自己的）
- 所有用了 `@ss-cmp/cmp-element` 或 `@ss-cmp/cmp-echarts` 的子应用都必须加这三条 alias
- 也可用 `.npmrc` 改 `auto-install-peers=false` + 手动在每个 sub-app 声明 peerDep 来源 —— 没做，alias 简单

## 40. SCSS `@use` 与 vue.config.js `additionalData` 冲突

- 症状：`@use rules must be written before any other rules` 编译失败
- 根因：`vue.config.js` 有 `additionalData: '@import "@/common/css/common-var.scss";'`，Sass 自动在每个 .scss 文件最前加这行 `@import`。SCSS 规则要求 `@use` 必须在所有 `@import` 之前，两者冲突
- 修复：在 packages/cmp-* 的 .vue 里用 `@import '@ss-cmp/design-tokens/src/tokens.scss';`（deprecated 但可用），**不用 `@use`**

## 41. sms-web shims-ajax.d.ts 不跨包作用 → packages/utils 编译失败

- 症状：`TS2339: Property 'success' does not exist on type 'AxiosResponse<any, any, {}>'`
- 根因：sms-web/src/common/types/shims-ajax.d.ts 做 axios module augmentation（`get<T, R=Base.IResponseData<T>>` 覆盖默认的 AxiosResponse），但这个增强只对 sms-web 的 TS program 有效；packages/utils 作为独立包用的是 axios 原生类型
- 修复：把 shims-ajax.d.ts 和 shims-global.d.ts（定义 Base.IResponseData）同时复制到 `packages/utils/src/` 一份

---

## 相关

- [project_cmp_pitfalls.md](project_cmp_pitfalls.md) — Vue 2→3 迁移期踩坑（1-38 条）
- [project_cmp_workspace_flow.md](project_cmp_workspace_flow.md) — workspace 抽取全流程 + 未验证组件清单
- [../../docs/migration/compat-layer.md](../../docs/migration/compat-layer.md) — `@ss-cmp/*` 接入使用指引
