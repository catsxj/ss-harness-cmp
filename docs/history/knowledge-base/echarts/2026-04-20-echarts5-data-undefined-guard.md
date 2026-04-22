# ECharts 5 组件 props.data 未定义导致 TypeError

## 问题描述

```
Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'forEach')
    at updateChart (LineCharts.vue:21:59)
```

ECharts 组件在 `onMounted` 时调用 `updateChart`，此时 `props.data` 可能还未从 API 加载，为 `undefined`。

## 原因分析

Vue 3 的 `<script setup>` 中 props 是响应式的，但初始值可能是 `undefined`。`useEcharts` composable 在 `onMounted` 时立即调用 `updateChart`，而异步数据还没到。

## 解决方案

两层防护：

```typescript
// 1. useEcharts.ts 中
function doUpdate() {
  if (chart.value && props.data) {  // 加 props.data 判断
    updateChart(chart.value, echarts)
  }
}

// 2. 每个 updateChart 函数开头
function updateChart(chartInstance: EChartsType) {
  if (!props.data) return
  const d = props.data as Record<string, unknown>
  if (!d.values || !d.keys) return  // 字段级防护
  // ...
}
```

## 适用范围

所有使用 ECharts 的子应用（scr-web / sms-web / cmp-web / cos-web / csc-web）

---
*2026-04-22 备注：csc-web 已移出本仓库单独维护，但此文档内容对所有 ECharts 使用场景仍适用。*
