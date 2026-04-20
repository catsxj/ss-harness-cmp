<template>
  <bar-reverse-chart v-bind="$attrs"
   :setting="configs"
  ></bar-reverse-chart>
</template>
<script>
import charts from 'cmp-echarts'
const { BarReverseCharts } = charts
const configs = {
  series: {
    label: {
      show: true,
      formatter: '{b}',
      color: '#fff',
      position: [10, -20]
    }
  },
  legend: {
    textStyle: {
      color: '#fff'
    }
  },
  xAxis: {
    axisLabel: {
      color: '#fff',
      interval: 0
    },
    axisLine: {
      lineStyle: {
        color: '#ffffff'
      }
    },
    splitArea: {
      show: false
    }
  },
  yAxis: {
    axisLine: { show: false },
    axisLabel: { show: false },
    axisTick: { show: false },
    splitLine: { show: false }
  }
}
export default {
  components: { BarReverseChart: BarReverseCharts },
  props: {
    setting: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  setup(props, context) {
    return {
      configs
    }
  }
}
</script>
