# 自研包 compat 层策略

> `cmp-element` / `cmp-echarts` / `cmp-socket` 等自研包基于 ElementUI + Vue 2，与 Element Plus + Vue 3 不兼容。
> **自研包源码不可升级**（版本锁定），在**应用侧**做 compat 层重新实现。

---

## 策略原则

1. **不碰自研包源码** —— 避免牵一发动全身影响所有子应用
2. **在子应用的 `src/common/compat/` 下**重新实现同名组件
3. **保持 API 兼容** —— 业务模板不改 prop / slot / event，只换组件来源
4. **用 Element Plus + 项目设计系统**作为底层

## cmp-element compat（15 个组件）

在 `{app}/src/common/compat/` 下：

| 组件 | 作用 | 实现要点 |
|------|------|----------|
| `BasicForm` / `BasicFormItem` | 带 validate 的表单 | 支持 validate 三种形态：String（预设键）/ Object（FormItemRule）/ Array；maxlength 自动转换 `{ max: N }` |
| `BasicTable` | 基础表格 + 分页 | 转发 el-table 属性 + 内置 el-pagination |
| `AdvanceTable` | 带搜索栏 + 分页 + 动作栏的表格 | 搜索栏 4 种 input type（Input/Select/DateRange/DatePicker）+ 7 事件 + 9 方法 + 列 scopedSlots + mount 自动 getList |
| `TableSearch` | 独立搜索栏（搭配 BasicTable） | configs 驱动，6 种 type（Input/Select/Date/DateRange/Cascade/Const），支持 initValue/onChange/service/sign/props 字段；onSearch 函数 prop 或 @search 事件 |
| `CommonDetail` / `CommonDetailItem` | 详情页容器 + 详情项 | 支持 `item_container` / `custom_content` / 默认 slot；返回按钮发 `goBack` 事件；父组件用 `v-show="!detail.visible"` 控制列表隐藏 |
| `StatusIcon` | 状态圆点 + 文字 | 按 type 映射颜色 |
| `SvgIcon` | SVG 图标 | 等同 `<el-icon>` 包装 |
| `Empty` | 空态 | Element Plus 自带类似，薄封装 |

## cmp-echarts compat（6 个图表 + 1 别名）

- 底层：`echarts@5.5` + `echarts-liquidfill@3.1`
- 共享 `useChart` composable：统一主题色 / 字体 / 网格线 / **空值防护**
- 组件：`BarCharts` / `BarReverseCharts` / `LineCharts` / `PieCharts` / `GaugeCharts` / `LiquidFillCharts` + `LoopCharts`（别名指向 `PieCharts`）

**TypeScript 配置**：`compilerOptions.moduleResolution` 必须从 `node` 改为 `bundler`，否则 echarts v5 的 ESM-only 入口解析失败。

## Qiankun 沙箱注意

Qiankun 的 `compilerOptions` 可能与子应用独立运行时不一致 —— 自动推断组件名不可靠。compat 层导出时**显式双注册** PascalCase + kebab-case：

```ts
// src/common/compat/index.ts
for (const [name, comp] of Object.entries(COMPONENTS)) {
  app.component(name, comp)            // PascalCase
  app.component(toKebab(name), comp)   // kebab-case
}
```

## 空值防护

所有 echarts 组件的 `updateChart` 函数开头必须：

```ts
if (!props.data) return
if (!d.values || !d.keys) return
```

避免 API 响应空数据导致 `Cannot read 'values' of undefined`。

## 相关踩坑

- `.claude/memory/project_cmp_pitfalls.md` 第 5、8、11、24、25、26、29、30、36 条
- `docs/history/failure-cases.md` 内 echarts / cmp-echarts / element-plus 相关条目

## 相关

- [element-plus-mapping.md](element-plus-mapping.md) — ElementUI → EP API 映射
- [vue3-syntax.md](vue3-syntax.md) — Vue 3 写法规则
- [../rules/agent-constraints.md](../rules/agent-constraints.md) — "自研包不改源码" 硬约束（必须 5）

---

## 2026-04-22 更新：迁至 pnpm workspace

sms-web Phase D 完成后，所有自研包兼容实现从 `sms-web/src/common/{compat,utils}` + `common/css/global-ui.scss` + `validate/index.ts` 抽到仓库根 `packages/` 下：

- `@ss-cmp/design-tokens` — tokens.scss + element-plus.scss（CSS 变量覆盖 + 32px 组件尺寸）
- `@ss-cmp/utils` — auth / crypto / day / request / resolvePath / uploadFile + shims-ajax.d.ts / shims-global.d.ts
- `@ss-cmp/cmp-element` — BasicForm / BasicFormItem / BasicTable / AdvanceTable / TableSearch / CommonDetail / CommonDetailItem / StatusIcon / SvgIcon / Empty + validate.ts
- `@ss-cmp/cmp-echarts` — BarCharts / BarReverseCharts / LineCharts / PieCharts / GaugeCharts / LiquidFillCharts + useChart.ts
- `@ss-cmp/cmp-topology` / `@ss-cmp/cmp-graph` — 空骨架，Phase 4 cmp-web 迁移期填
- `cmp-socket` 保留原包（B 档）

### cmp-web / cms-web / cos-web 迁移时接入方式

1. **package.json 加 workspace:\* 依赖**
   ```json
   "dependencies": {
     "@ss-cmp/design-tokens": "workspace:*",
     "@ss-cmp/utils": "workspace:*",
     "@ss-cmp/cmp-element": "workspace:*",
     "@ss-cmp/cmp-echarts": "workspace:*"
   }
   ```

2. **vue.config.js 加 transpileDependencies + vue 单实例 alias**
   ```js
   module.exports = {
     transpileDependencies: [/@ss-cmp\//],
     chainWebpack: (config) => {
       config.resolve.alias
         .set('vue$', resolve('node_modules/vue'))
         .set('element-plus$', resolve('node_modules/element-plus'))
         .set('@element-plus/icons-vue$', resolve('node_modules/@element-plus/icons-vue'))
     }
   }
   ```
   **vue 单实例 alias 必须加** —— `.npmrc` `auto-install-peers=true` 会把 peerDep 装成独立副本，不 alias 会 `<slot>` 跨包报 `null.ce`（见 pitfalls 第 39 条）

3. **tsconfig.json include 扩展**
   ```json
   "include": [
     "src/**/*.ts", "src/**/*.tsx", "src/**/*.vue", "src/**/*.d.ts",
     "../packages/*/src/**/*.ts",
     "../packages/*/src/**/*.vue",
     "../packages/*/src/**/*.d.ts"
   ]
   ```

4. **main.ts 注册 + 配置注入**
   ```ts
   import { registerCmpElement } from '@ss-cmp/cmp-element'
   import { registerCmpEcharts } from '@ss-cmp/cmp-echarts'
   import { configureAuth, configureRequest } from '@ss-cmp/utils'
   import '@ss-cmp/design-tokens/src/element-plus.scss'
   import { tokenKey } from '@/config'

   configureAuth({ tokenKey })
   configureRequest({
     onUnauthorized: () => { /* sub-app 自己的 permission store reset */ }
   })

   registerCmpElement(app)
   registerCmpEcharts(app)
   ```

### SCSS 注意事项

- 组件内引 tokens 用 `@import '@ss-cmp/design-tokens/src/tokens.scss';`（**不能用 `@use`**，会和 vue.config.js 的 `additionalData: '@import "@/common/css/common-var.scss";'` 的 "`@use` 必须在所有 @import 之前" 规则冲突）

### sms-web 留的 stub 层

`sms-web/src/common/utils/{auth,crypto,day,request,resolvePath,uploadFile}.ts` 各留了一行 re-export stub 指向 `@ss-cmp/utils`，保留原 `utils/*` 别名 import 不动，避免 60+ 业务文件批量改。cmp-web 迁移时建议直接 import `@ss-cmp/utils`，不要再走 stub。

详细设计见 [../superpowers/specs/2026-04-22-common-compat-workspace-design.md](../superpowers/specs/2026-04-22-common-compat-workspace-design.md)。
