<template>
  <div :class="className" :style="{height:height,width:width}" :id="id"></div>
</template>

<script>
import mixins from '../mixins';

export default {
  mixins: [mixins],
  data () {
    return {};
  },
  methods: {
    updateChart () {
      const series = [];
      series.push(
        {
          type: 'gauge',
          center: ['50%', '55%'],
          radius: '90%',
          // min: this.data.min,
          // max: this.data.max,
          axisLine: { // 坐标轴线
            lineStyle: { // 属性lineStyle控制线条样式
              width: 5
            }
          },
          axisTick: { // 坐标轴小标记
            length: 15, // 属性length控制线长
            lineStyle: { // 属性lineStyle控制线条样式
              color: 'auto'
            }
          },
          splitLine: { // 分隔线
            length: 10, // 属性length控制线长
            lineStyle: { // 属性lineStyle（详见lineStyle）控制线条样式
              color: 'auto'
            }
          },
          title: {
            // 其余属性默认使用全局文本样式，详见TEXTSTYLE
            fontWeight: 'bolder',
            fontSize: 18,
            color: '#fff'
          },
          axisLabel: {
            fontSize: 8
          },
          detail: {
            fontSize: 16
          },
          data: this.data
        }
      );
      const options = {
        tooltip: {
          formatter: '{a} <br/>{c} {b}'
        },
        toolbox: this.setting.toolbox,
        series: series
      };
      this.chart.setOption(options, true);
    }
  }
};
</script>
