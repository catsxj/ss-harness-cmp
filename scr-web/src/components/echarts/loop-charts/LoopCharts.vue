<template>
   <div :style="{height:height,width:width}" class="chart-container">
    <div class="chart" :class="{hide: isNoData}" :id="id" style="width: 100%;height: 100%"></div>
    <NoData  v-show="isNoData" class="chart-no-data"></NoData>
  </div>
</template>

<script>
import mixins, { getLinerColor } from '../mixins';
import { legend } from '../defaultSetting';

export default {
  mixins: [mixins],
  props: {
    theme: {
      type: String,
      default: '数值'
    },
    centerText: {
      type: String,
      default: '总数'
    }
  },
  data () {
    return {
      total: 0
    };
  },
  computed: {
    isNoData() {
      return !this.data || !this.data.length
    }
  },
  methods: {
    updateChart: function() {
      const { legendColor } = this.themeColor
      const legends = []
      this.total = 0
      const countMap = {}
      this.data.forEach(item => {
        legends.push(item.name)
        this.total += item.value / 1
        countMap[item.name] = item.value >= 0 ? item.value : 0
      })
      this.total = this.total.toFixed(this.setting.fixed)
      const that = this
      const options = {
        color: this.setting.color,
        title: {
          text: this.data.title
        },
        tooltip: {
          trigger: 'item',
          confine: true,
          // formatter: `{a} <br/>{b} : {c}${this.unit || ''} ({d}%)`,
          formatter: function(params) {
            const str = params.seriesName + '</br>' + params.name + ':' + (params.data.value >= 0 ? params.data.value : 0) + (that.unit ? that.unit : '') + '(' + (params.percent >= 0 ? params.percent : 0) + '%)'
            return str
          }
        },
        legend: {
          // ...legend,
          data: legends,
          bottom: 0,
          itemGap: 15,
          formatter: name => {
            const { legendLength = 10 } = this.setting
            const resultName = `${name.substr(0, legendLength)}${name.length > legendLength ? '...' : ''}`
            return `{name|${resultName}}{count|${countMap[name]}${that.unit || ''}}`
          },
          textStyle: {
            rich: {
              name: {
                align: 'left',
                color: legendColor || '#666',
                width: 50
              },
              count: {
                align: 'right',
                color: legendColor || '#7e7e7e',
                width: this.setting.richCount || 100,
                fontWeight: 600
              }
            }
          },
          tooltip: {
            show: true
          },
          ...this.setting.legend
        },
        toolbox: this.setting.toolbox,
        series: [
          {
            name: this.theme,
            type: 'pie',
            avoidLabelOverlap: false,
            hoverAnimation: false,
            label: {
              normal: {
                show: true,
                position: 'center',
                formatter: function() {
                  return `{count|${that.centerText}\r\n\r\n${that.total}${that.unit}}`
                },
                textStyle: {
                  color: legendColor || '#5F6264'
                },
                rich: {
                  count: {
                    fontSize: 19,
                    color: legendColor || '#5F6264'
                  }
                }
              },
              emphasis: {
                show: false,
                textStyle: {
                  fontSize: '14',
                  fontWeight: 'bold'
                }
              }
            },
            radius: this.setting.radius || ['50%', '65%'],
            center: this.setting.center || ['50%', '50%'],
            data: this.data
          }
        ],
        ...this.options
      }
      this.chart.setOption(options, true)
    }
  }
};
</script>
<style lang="scss" scoped>
@import '../index';
</style>
