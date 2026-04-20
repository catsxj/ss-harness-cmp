<template>
    <div :class="className" :id="id" :style="{height:height,width:width}"></div>
</template>

<script>
import mixins from '../mixins';
import { yAxis, xAxis } from '../defaultSetting';

export default {
  mixins: [mixins],
  data () {
    return {};
  },
  methods: {
    updateChart () {
      const axisColor = '#ffffff'
      const legends = [];
      const series = [];
      const { showLegend = true } = this.setting;
      this.data.values.forEach(item => {
        legends.push(item.name);
        series.push({
          name: item.name,
          type: 'line',
          symbol: 'none',
          smooth: true,
          areaStyle: {
            opacity: 0.3
          },
          data: item.data
        });
      });
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
          left: 1,
          right: 1,
          top: 30,
          bottom: 0,
          containLabel: true
        },
        legend: {
          show: showLegend,
          type: 'scroll',
          padding: [0, 20],
          top: 0,
          data: legends,
          textStyle: {
            color: '#fff'
          }
        },
        xAxis: [{
          ...xAxis,
          type: 'category',
          data: this.data.keys.map(item => {
            return item.replace(' ', '\n');
          }),
          axisLabel: {
            color: axisColor || '#AAB3C0',
            rotate: this.setting.axisLabelRotate
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          },
          splitArea: {
            show: false,
            areaStyle: {
              color: ['rgba(255,255,255,1)', 'rgba(248,251,255,1)']
            }
          }
        }],
        yAxis: [{
          ...yAxis,
          name: this.unit,
          axisLabel: {
            color: axisColor || '#AAB3C0'
          },
          nameTextStyle: {
            color: axisColor || '#AAB3C0'
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
        }],
        series: series
      };
      this.chart.setOption(options, true);
    }
  }
};
</script>
