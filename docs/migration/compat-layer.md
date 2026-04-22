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
