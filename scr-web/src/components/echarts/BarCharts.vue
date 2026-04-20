<template>
  <bar-chart v-bind="$attrs"
   :setting="configs"
  ></bar-chart>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import BarChart from './bar-charts/BarCharts.vue'

const props = defineProps({
  setting: {
    type: Object,
    default() {
      return {}
    },
  },
})

const configs = computed(() => {
  const { rotate = 0 } = props.setting
  return {
    series: {
      label: {
        show: true,
        color: '#fff',
        position: 'top',
      },
    },
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
        interval: 0,
        rotate,
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
})
</script>
