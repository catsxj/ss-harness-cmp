<template>
  <pie-chart v-bind="$attrs"
   :setting="setting"
  ></pie-chart>
</template>
<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import PieChart from './pie-charts/PieCharts.vue'

const props = defineProps({
  configs: {
    type: Object,
    default() {
      return {}
    },
  },
})

const attrs = useAttrs()

const setting = computed(() => {
  const data = (attrs.data || []) as Array<{ value: number }>
  const total = data.reduce((sum, item) => {
    return sum + item.value / 1
  }, 0)
  return {
    legend: {
      textStyle: {
        rich: {
          name: {
            align: 'left',
            color: '#fff',
            width: 50,
          },
          count: {
            align: 'right',
            color: '#fff',
            width: 50,
            fontWeight: 600,
          },
        },
      },
    },
    series: {
      label: {
        show: true,
        position: 'center',
        formatter: function () {
          return `{count|总数\r\n\r\n${total}}`
        },
        textStyle: {
          color: '#fff',
        },
        rich: {
          count: {
            fontSize: 19,
            color: '#fff',
          },
        },
      },
      itemStyle: {},
    },
    ...props.configs,
  }
})
</script>
