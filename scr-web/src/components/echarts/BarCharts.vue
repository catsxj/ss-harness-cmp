<template>
  <bar-chart v-bind="$attrs"
   :setting="configs"
  ></bar-chart>
</template>
<script>
import charts from 'cmp-echarts'
const { BarCharts } = charts
export default {
  components: { BarChart: BarCharts },
  props: {
    setting: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  setup(props, context) {
    const { rotate = 0 } = props.setting
    const configs = {
      series: {
        label: {
          show: true,
          color: '#fff',
          position: 'top'
        }
      },
      legend: {
        textStyle: {
          color: '#fff'
        },
        pageIconColor: '#fff',
        pageIconInactiveColor: '#2F4554'
      },
      xAxis: {
        axisLabel: {
          color: '#fff',
          interval: 0,
          rotate
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
    return {
      configs
    }
  }
}
</script>
