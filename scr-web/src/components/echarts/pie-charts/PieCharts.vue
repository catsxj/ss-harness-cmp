<template>
  <div :style="{height:height,width:width}" class="chart-container">
    <div class="chart" :class="{hide: isNoData}" :id="id" style="width: 100%;height: 100%"></div>
    <div key="no-data" v-show="isNoData" class="chart-no-data">
      <i class="iconfont icon-zanwushuju" />
      <span>暂无数据</span>
    </div>
  </div>
</template>

<script>
import mixins, { getLinerColor } from '../mixins';
import { legend } from '../defaultSetting';

export default {
  mixins: [mixins],
  props: {
    theme: {
      type: String
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
    updateChart: function () {
      const { linerColor, colorMap = {} } = this.setting;
      const legends = [];
      this.data.forEach(item => {
        legends.push(item.name);
        item.itemStyle = {
          color: colorMap[item.name]
        }
      });
      const color = linerColor && linerColor.map(item => {
        return getLinerColor(item[0], item[1])
      })
      // color: color || [getLinerColor('#FF9E8A', '#E30829'), getLinerColor('#FFA145', '#FF634B'), getLinerColor('#FAD961', '#FF9051'), getLinerColor('#8699FF', '#4B66FF')],
      const options = {
        color: color || ['#F84540', '#FF9900', '#2D8CF0', '#19BE6B', '#696BD8', '#D4D5E7'],
        tooltip: {
          trigger: 'item',
          formatter: `{a} <br/>{b} : {c}${this.unit || ''} ({d}%)`
        },
        legend: {
          ...legend,
          data: legends,
          bottom: 0,
          itemGap: 20,
          ...this.setting.legend
        },
        toolbox: this.setting.toolbox,
        series: [{
          name: this.theme,
          type: 'pie',
          radius: '80%',
          roseType: 'radius',
          center: this.setting.center || ['50%', '50%'],
          data: this.data,
          label: {
            normal: {
              formatter: ['{c|{c}' + this.unit + '}'].join('\n'),
              rich: {
                c: {
                  color: '#CED1DE',
                  fontSize: 12,
                  fontWeight: 400
                }
              }
            }
          },
          labelLine: {
            normal: {
              lineStyle: {
                color: '#CED1DE'
              },
              length: 5,
              length2: 10

            }
          }
        }]
      };
      this.chart.setOption(options, true);
    }
  }
};
</script>
<style lang="scss" scoped>
@import '../index';
</style>
