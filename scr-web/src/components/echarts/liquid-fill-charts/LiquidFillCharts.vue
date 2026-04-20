<template>
    <div :class="className" :id="id" :style="{height:height,width:width}"></div>
</template>

<script>
import mixins from '../mixins';
import 'echarts-liquidfill';

export default {
  mixins: [mixins],
  props: {
    theme: {
      type: String
    }
  },
  data () {
    return {};
  },
  methods: {
    updateChart () {
      this.chart.setOption({
        series: {
          type: 'liquidFill',
          radius: '90%',
          data: [this.data, this.data / 1 - 0.05],
          itemStyle: {
            shadowBlur: 0
          },
          color: ['#0669D9', '#60BBFF'],
          label: {
            normal: {
              color: '#fff',
              textStyle: {
                fontSize: 30,
                fontFamily: 'helveticaNeue Thin'
              }
            }
          },
          backgroundStyle: {
            borderColor: '#1871C6',
            borderWidth: 1,
            // opacity: 0.5,
            color: '#2D1F61'
          },
          outline: {
            show: true
          },
          phase: 0,
          period: 4000,
          waveLength: '100%',
          animationDurationUpdate: 2000
        }
      });
    }

  }
};
</script>
