<template>
  <line-chart v-bind="$attrs"
   :setting="setting"
  ></line-chart>
</template>
<script>
import charts from 'cmp-echarts'
import 'cmp-echarts/lib/cmp-echarts.css'

const { LineCharts } = charts
const setting = {
  legend: {
    textStyle: {
      color: '#fff'
    },
    pageIconColor: '#fff',
    pageIconInactiveColor: '#2F4554'
  },
  xAxis: {
    axisLabel: {
      color: '#fff'
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
    axisLabel: {
      color: '#fff'
    },
    nameTextStyle: {
      color: '#fff'
    },
    axisLine: {
      lineStyle: {
        color: '#ffffff'
      }
    },
    splitLine: {
      lineStyle: {
        type: 'solid',
        color: '#1B263D'
      }
    }
  }
}
export default {
  components: { LineChart: LineCharts },
  setup(props, context) {
    return {
      setting
    }
  }
}
</script>
