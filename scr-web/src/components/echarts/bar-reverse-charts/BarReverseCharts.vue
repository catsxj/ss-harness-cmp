<template>
  <div :class="className" :id="id" :style="{height:height,width:width}"></div>
</template>

<script>
import mixins, { getLinerColor } from '../mixins'
import { yAxis, xAxis, grid } from '../defaultSetting'

export default {
  mixins: [mixins],
  data () {
    return {}
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
      const { barColor: [startColor = '#8699FF', endColor = '#4B66FF'] = [], yAxisLabel = {}, showXAxis = true } = this.setting;
      this.data.values.forEach(item => {
        legends.unshift(item.name)
        series.push({
          name: item.name,
          type: 'bar',
          smooth: true,
          stack: 'all',
          barMaxWidth: 11,
          itemStyle: {
            normal: {
              // barBorderRadius: 5,
              areaStyle: { type: 'default' },
              color: getLinerColor(startColor, endColor)
            }
          },
          data: item.data.reverse(),
          zlevel: 11
        })
      })
      const options = {
        color: this.setting.color,
        title: {
          text: this.data.title
        },
        tooltip: {
          trigger: 'axis'
        },
        toolbox: this.setting.toolbox,
        grid: {
          ...grid,
          top: 10,
          left: '1%',
          right: '5%'
        },
        xAxis: [{
          show: showXAxis,
          ...xAxis,
          type: 'value',
          name: this.unit,
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitArea: {
            show: false,
            areaStyle: {
              color: ['rgba(255,255,255,1)', 'rgba(248,251,255,1)']
            }
          },
          axisLabel: {
            color: '#fff'
          }
        }],
        yAxis: [{
          ...yAxis,
          type: 'category',
          data: this.data.keys.map(item => {
            return item.replace(' ', '\n')
          }),
          axisLine: {
            show: false
          },
          splitLine: {
            show: false
          },
          axisLabel: {
            color: '#ffffff',
            ...yAxisLabel
          },
          splitArea: {
            show: true,
            areaStyle: {
              color: ['rgba(0,0,0,0.0)', 'rgba(250,250,250,0.05)']
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
