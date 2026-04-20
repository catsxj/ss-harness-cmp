<template>
     <div :style="{height:height,width:width}" class="chart-container">
    <div class="chart" :class="{hide: isNoData}" :id="id" style="width: 100%;height: 100%"></div>
    <NoData  v-show="isNoData" class="chart-no-data"></NoData>
  </div>
</template>

<script>
import mixins, { getLinerColor } from '../mixins'
import { yAxis, xAxis, grid } from '../defaultSetting'
import Axios from 'axios'

export default {
  props: {
    is3d: {
      type: Boolean,
      default: false
    }
  },
  mixins: [mixins],
  data () {
    return {}
  },
  computed: {
    isNoData() {
      return !this.data.keys || !this.data.keys.length;
    }
  },
  mounted () {
    this.eveSet()
  },
  methods: {
    // 对画布绑定事件
    eveSet () {
      this.chart.on('click', (params) => {
        const event = params.event.event
        event.stopPropagation()
        this.$emit('goToPage', params)
      })
    },
    updateChart () {
      const legends = []
      const series = []
      const { colorMap = {}, linerColor, axisLabel = {}, showSeriesLabel = true } = this.setting;
      const color = (linerColor && linerColor.map(item => {
        return getLinerColor(item[0], item[1])
      }));
      //  [getLinerColor('#0089FF', '#A057A1')];
      const { values = [], keys = [] } = this.data;
      const { showLegend = false } = this.setting;
      values.forEach((item, index) => {
        legends.push(item.name)
        const data = item.data.map(cell => {
          return {
            value: cell,
            itemStyle: {
              color: colorMap[item.name]
            }
          }
        })
        series.push({
          name: item.name,
          type: 'bar',
          smooth: true,
          stack: 'all',
          barMaxWidth: 30,
          label: {
            show: showSeriesLabel,
            position: 'top',
            color: '#fff'
          },
          itemStyle: {
            // normal: {
            //   areaStyle: { type: 'default' },
            //   color: new this.echarts.graphic.LinearGradient(
            //     0, 0, 1, 1, [{
            //       offset: 0,
            //       color: startColor
            //     },
            //     {
            //       offset: 1,
            //       color: endColor
            //     }
            //     ]
            //   )
            // }
          },
          data,
          zlevel: 11
        });
        if (this.is3d) {
          series.push({
            type: 'bar',
            barWidth: 8,
            itemStyle: {
              normal: {
                color
              }
            },
            barGap: 0,
            data
          }, {
            name: 'b',
            tooltip: {
              show: false
            },
            type: 'pictorialBar',
            itemStyle: {
              borderWidth: 1,
              borderColor: color[0],
              color: color[0]
            },
            symbol: 'path://M 0,0 l 120,0 l -30,60 l -120,0 z',
            symbolSize: ['30', '12'],
            symbolOffset: ['0', '-8'],
            symbolRotate: 5,
            symbolPosition: 'end',
            data,
            z: 3
          })
        }
      })
      const options = {
        color,
        legend: {
          show: showLegend,
          top: 0,
          textStyle: {
            color: '#fff'
          }
        },
        title: {
          text: this.data.title
        },
        tooltip: {
          trigger: 'axis',
          ...(this.setting.tooltip || {})
        },
        toolbox: this.setting.toolbox,
        grid: {
          ...grid,
          top: 30,
          left: '1%',
          right: '5%',
          bottom: 1
        },
        xAxis: [{
          ...xAxis,
          type: 'category',
          name: this.unit,
          splitLine: {
            show: false
          },
          axisLabel: {
            color: '#fff',
            interval: 0,
            ...axisLabel
          },
          axisTick: {
            show: false
          },
          data: this.data.keys.map(item => {
            return item.replace(' ', '\n')
          })
        }],
        yAxis: [{
          ...yAxis,
          type: 'value',
          splitLine: {
            show: false
          },
          axisLabel: {
            color: '#fff'
          },
          splitArea: {
            show: false,
            areaStyle: {
              color: ['rgba(255,255,255,1)', 'rgba(248,251,255,1)']
            }
          }
        }],
        series: series
      }
      this.chart.setOption(options, true)
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../index';
</style>
