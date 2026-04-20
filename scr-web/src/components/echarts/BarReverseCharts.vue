<template>
  <bar-reverse-chart v-bind="$attrs"
   :setting="configs"
  ></bar-reverse-chart>
</template>
<script setup lang="ts">
import BarReverseChart from './bar-reverse-charts/BarReverseCharts.vue'

defineProps({
  setting: {
    type: Object,
    default() {
      return {}
    },
  },
})

const configs = {
  series: {
    label: {
      show: true,
      formatter: '{b}',
      color: '#fff',
      position: [10, -20],
    },
  },
  legend: {
    textStyle: {
      color: '#fff',
    },
  },
  xAxis: {
    axisLabel: {
      color: '#fff',
      interval: 0,
    },
    axisLine: {
      lineStyle: {
        color: '#ffffff',
      },
    },
    splitArea: {
      show: false,
    },
  },
  yAxis: {
    axisLine: { show: false },
    axisLabel: { show: false },
    axisTick: { show: false },
    splitLine: { show: false },
  },
}
</script>
