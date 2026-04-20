<template>
  <pie-chart v-bind="$attrs"
   :setting="setting"
  ></pie-chart>
</template>
<script>
import charts from 'cmp-echarts'
import { computed } from '@vue/composition-api'
const { PieCharts } = charts
export default {
  props: {
    configs: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  components: { PieChart: PieCharts },
  setup(props, context) {
    console.log(context)
    const setting = computed(() => {
      const { attrs: { data = [] } } = context;
      const total = data.reduce((total, item) => {
        return total + item.value / 1
      }, 0)
      return {
        legend: {
          textStyle: {
            rich: {
              name: {
                align: 'left',
                color: '#fff',
                width: 50
              },
              count: {
                align: 'right',
                color: '#fff',
                width: 50,
                fontWeight: 600
              }
            }
          }
        },
        series: {
          label: {
            show: true,
            position: 'center',
            formatter: function() {
              return `{count|总数\r\n\r\n${total}}`
            },
            textStyle: {
              color: '#fff'
            },
            rich: {
              count: {
                fontSize: 19,
                color: '#fff'
              }
            }
          },
          itemStyle: {}
        },
        ...props.configs
      }
    })
    return {
      setting
    }
  }
}
</script>
