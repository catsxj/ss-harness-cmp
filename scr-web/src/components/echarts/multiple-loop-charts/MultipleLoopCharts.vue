<template>
    <div :class="className" :id="id" :style="{height:height,width:width}"></div>
</template>

<script>
import mixins from '../mixins';

export default {
  mixins: [mixins],
  props: {
    theme: {
      type: String
    },
    wrapperId: {
      type: String
    }
  },
  methods: {
    updateChart: function () {
      const seriesArr = [];
      const total = this.data.reduce((totals, item) => {
        return totals + item.value / 1;
      }, 0);
      const { unit } = this
      const { color = [], radius, offset = 200 } = this.setting;
      this.data.forEach((item, index) => {
        const textColor = color[index] || '#3392FF'
        const centerX = 80 + index * offset
        seriesArr.push(
          {
            name: item.name,
            type: 'pie',
            radius: radius || ['43%', '54%'],
            center: [centerX, '50%'],
            z: 10,
            data: [{
              name: '',
              value: item.value,
              label: {
                normal: {
                  rich: {
                    a: {
                      color: '#999999',
                      align: 'center',
                      fontSize: 12
                    },
                    b: {
                      color: textColor,
                      align: 'center',
                      fontSize: 14,
                      fontWeight: 500
                    }
                  },
                  formatter: function (params) {
                    return `{b|${params.value}${unit} ${params.percent}%}\n\n{a| ${params.seriesName}}`;
                  }
                }
              },
              itemStyle: {
                normal: {
                  labelLine: {
                    show: false
                  },
                  color: textColor
                }
              }
            }, {
              value: total - item.value,
              itemStyle: {
                color: 'transparent'
              }
            }],
            label: {
              normal: {
                position: 'center'
              }
            }
          },
          {
            name: item.name,
            type: 'pie',
            radius: radius || ['45%', '52%'],
            itemStyle: {
              normal: {
                Label: {
                  show: false
                },
                labelLine: {
                  show: false
                },
                color: '#EBEBEB'
              }
            },
            center: [centerX, '50%'],
            data: [{
              value: item.value
            }, {
              value: total - item.value
            }]
          }
        )
      });
      const options = {
        color: color,
        series: seriesArr
      };
      this.chart.setOption(options, true);
    }
  }
};
</script>
