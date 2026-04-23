# @ss-cmp/cmp-echarts

原 `cmp-echarts@2.0.0-5.6-release`（Vue 2 + echarts v4）的 Vue 3 替代包。**全部为 API-兼容重新实现**（不是 A 档 port）：

- 原版 6 个 `*Charts.vue` **无源码**（只有 `lib/cmp-echarts.common.js` webpack 压缩输出），sms-web Phase D 按业务用法 + 原 prop/event API 在 echarts v5 上从头写
- 原版 `hooks/useChart.js` + `hooks/echarts.js` 有源码（Vue 2 + `@vue/composition-api`），但当前版 `useChart.ts` 是 **enhanced 重写**（不是直接 port），加了 `DEFAULT_COLORS / AXIS_LINE / AXIS_LABEL / AXIS_NAME_TEXT / SPLIT_LINE_DASHED` 跨图共享常量和 TypeScript 类型

## 组件清单

| 组件 | 原路径 | 类别 | 说明 |
|------|--------|------|------|
| BarCharts | `lib/cmp-echarts.common.js` bar-charts/ | 重新实现 | 业务调用 API 对齐原版 |
| BarReverseCharts | `lib/cmp-echarts.common.js` bar-reverse-charts/ | 重新实现 | |
| LineCharts | `lib/cmp-echarts.common.js` line-charts/ | 重新实现 | |
| PieCharts | `lib/cmp-echarts.common.js` pie-charts/ | 重新实现 | |
| GaugeCharts | `lib/cmp-echarts.common.js` gauge-charts/ | 重新实现 | |
| LiquidFillCharts | `lib/cmp-echarts.common.js` liquid-fill-charts/ | 重新实现 | 用 `echarts-liquidfill@3.1` |
| LoopCharts (alias) | — | alias → PieCharts | sms-web 现状；cmp-web 迁移时对照原版确认 |

## useChart composable

- 原版 signature: `export default function (props, updateChart)` — Vue 2 + vue-demi
- 当前版 signature: 重新设计的 Vue 3 API，带 `Ref` / `WatchSource` / 主题常量

**原版 useChart.js / echarts.js 源码保留在 `original/cmp-echarts/hooks/` 供参考**。

## 空值防护

所有图表 `updateChart` 开头：

```ts
if (!props.data) return
if (!d.values || !d.keys) return
```

避免 API 响应空数据导致 `Cannot read 'values' of undefined`。

## 外部依赖

- `echarts@^5.5`
- `echarts-liquidfill@^3.1`
- `vue` peerDep
