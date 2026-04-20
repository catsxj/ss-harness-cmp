<template>
  <line-chart v-bind="$attrs"
   :setting="setting"
  ></line-chart>
</template>
<script setup lang="ts">
import LineChart from './line-charts/LineCharts.vue'

const setting = {
  legend: {
    textStyle: {
      color: '#fff',
    },
    pageIconColor: '#fff',
    pageIconInactiveColor: '#2F4554',
  },
  xAxis: {
    axisLabel: {
      color: '#fff',
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
    axisLabel: {
      color: '#fff',
    },
    nameTextStyle: {
      color: '#fff',
    },
    axisLine: {
      lineStyle: {
        color: '#ffffff',
      },
    },
    splitLine: {
      lineStyle: {
        type: 'solid',
        color: '#1B263D',
      },
    },
  },
}
</script>
