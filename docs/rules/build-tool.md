# 构建工具约束：保持 Vue CLI，禁止切 Vite

> 迁移 Vue 2 → Vue 3 时**不改变构建工具**。保持 vue-cli-service（webpack）作为构建方式，不切换到 Vite。

---

## 硬性规则

- 保持 `@vue/cli-service`，升级到 **v5**（支持 Vue 3 + webpack 5）
- 保留 `vue.config.js`，**不创建** `vite.config.ts`
- 保留 `public/index.html`，**不创建**根目录 `index.html`
- `package.json scripts` 保持 `vue-cli-service serve / build`

## Why

用户明确要求"根据原有的构建方式启动构建即可，不用改为 vite 启动构建"。  
减少迁移变量，降低风险 —— 同时切框架 + 切构建工具会让回滚 / 定位问题复杂度翻倍。

## How to apply

迁移一个子应用时：
1. `package.json` 的 `@vue/cli-service` 从 `~4.4.1` 升到 `~5.0.x`
2. `vue.config.js` 照搬原版，按需调整：
   - webpack 5 配置：`jsonpFunction` → `chunkLoadingGlobal`
   - sass-loader 14+：`prependData` → `additionalData`
   - `compress-webpack-plugin` → `compression-webpack-plugin`
3. 依赖 Vite-only 语法的地方改回 webpack 兼容写法：
   - `import.meta.env.VITE_*` → `process.env.VUE_APP_*`
   - `url('@/assets/...')` 在 Vue CLI 里也支持（比 `~assets/...` 更通用，推荐）
   - `.vue` 后缀 Vue CLI 会自动解析，显式写也可以

## 例外

- **scr-web 已用 Vite 完成迁移**（先做的试点，规则定下之前）。后续子应用不再这样做。
- csc-web 保持 Vue 2 不迁移，构建方式也维持 Vue CLI 4。

## 相关踩坑

迁移后从 webpack 4 升 webpack 5 + sass-loader 升级引发的配置调整，见 [`.claude/memory/project_cmp_pitfalls.md`](../../.claude/memory/project_cmp_pitfalls.md) 第 21 条。

## 相关

- [agent-constraints.md](agent-constraints.md) — "必须/禁止" 规则总表（禁止 7）
- [../migration/lifecycle.md](../migration/lifecycle.md) — Phase B 执行构建验证
