<template>
  <div :class="className" :id="id" :style="{height:height,width:width}"></div>
</template>

<script>
import mixins from '../mixins';
import request from 'axios'
export default {
  mixins: [mixins],
  data () {
    return {
    };
  },
  mounted () {
    this.eveSet();
  },
  methods: {
    eveSet () {
      this.chart.on('click', (params) => {
        if (params.componentSubType === 'effectScatter') {
          this.$emit('callback', params.data);
        }
      });
    },
    async updateChart () {
      const data = await request.get('/static/suzhou.json');

      this.echarts.registerMap('suzhou', data.data)
      var points = [
        { value: [120.731263, 31.33346], itemStyle: { color: '#4ab2e5' } },
        { value: [120.755293, 31.263135], itemStyle: { color: '#4fb6d2' } },
        { value: [120.665507, 31.392156], itemStyle: { color: '#52b9c7' } },
        { value: [120.802975, 31.366708], itemStyle: { color: '#5abead' } },
        { value: [120.764393, 31.185771], itemStyle: { color: '#f34e2b' } }
      ]
      const options = {
        backgroundColor: 'rgba(128, 128, 128, 0.1)',
        geo: {
          show: false,
          map: 'suzhou',
          aspectScale: 0.75, // 长宽比
          zoom: 1.1,
          roam: false,
          itemStyle: {
            normal: {
              areaColor: {
                type: 'radial',
                x: 0.5,
                y: 0.5,
                r: 0.8,
                colorStops: [{
                  offset: 0,
                  color: '#09132c' // 0% 处的颜色
                }, {
                  offset: 1,
                  color: '#274d68' // 100% 处的颜色
                }],
                globalCoord: true // 缺省为 false
              },
              shadowColor: 'rgb(58,115,192)',
              shadowOffsetX: 10,
              shadowOffsetY: 11
            },
            emphasis: {
              areaColor: '#2AB8FF',
              borderWidth: 0,
              color: 'green',
              label: {
                show: false
              }
            }
          },
          regions: [{
            name: '南海诸岛',
            itemStyle: {
              areaColor: 'rgba(0, 10, 52, 1)',

              borderColor: 'rgba(0, 10, 52, 1)',
              normal: {
                opacity: 0,
                label: {
                  show: false,
                  color: '#009cc9'
                }
              }
            }

          }]
        },
        series: [{
          type: 'map',
          roam: false,
          label: {
            normal: {
              show: true,
              textStyle: {
                color: '#1DE9B6'
              }
            },
            emphasis: {
              textStyle: {
                color: 'rgb(183,185,14)'
              }
            }
          },

          itemStyle: {
            normal: {
              borderColor: 'rgb(147, 235, 248)',
              borderWidth: 1,
              areaColor: {
                type: 'radial',
                x: 0.5,
                y: 0.5,
                r: 0.8,
                colorStops: [{
                  offset: 0,
                  color: '#09132c' // 0% 处的颜色
                }, {
                  offset: 1,
                  color: '#274d68' // 100% 处的颜色
                }],
                globalCoord: true // 缺省为 false
              }
            },
            emphasis: {
              areaColor: 'rgb(46,229,206)',
              //    shadowColor: 'rgb(12,25,50)',
              borderWidth: 0.1
            }
          },
          zoom: 1.1,
          //     roam: false,
          map: 'china' // 使用
          // data: this.difficultData //热力图数据   不同区域 不同的底色
        }, {
          type: 'effectScatter',
          coordinateSystem: 'geo',
          showEffectOn: 'render',
          zlevel: 1,
          rippleEffect: {
            period: 15,
            scale: 4,
            brushType: 'fill'
          },
          hoverAnimation: true,
          label: {
            normal: {
              formatter: '{b}',
              position: 'right',
              offset: [15, 0],
              color: '#fff',
              show: true
            }
          },
          itemStyle: {
            normal: {
              color: '#1DE9B6', /* function (value){ //随机颜色 return "#"+("00000"+((Math.random()*16777215+0.5)>>0).toString(16)).slice(-6);
 } */
              shadowBlur: 10,
              shadowColor: '#333'
            }
          },
          symbolSize: 12,
          data: points
        }, // 地图线的动画效果
        {
          type: 'lines',
          zlevel: 2,
          effect: {
            show: true,
            period: 4, // 箭头指向速度，值越小速度越快
            trailLength: 0.4, // 特效尾迹长度[0,1]值越大，尾迹越长重
            symbol: 'arrow', // 箭头图标
            symbolSize: 7 // 图标大小
          },
          lineStyle: {
            normal: {
              color: '#1DE9B6', /* function (value){ //随机颜色

                        ['#f21347','#f3243e','#f33736','#f34131','#f34e2b',
                        '#f56321','#f56f1c','#f58414','#f58f0e','#f5a305',
                        '#e7ab0b','#dfae10','#d5b314','#c1bb1f','#b9be23',
                        '#a6c62c','#96cc34','#89d23b','#7ed741','#77d64c',
                        '#71d162','#6bcc75','#65c78b','#5fc2a0','#5abead',
                        '#52b9c7','#4fb6d2','#4ab2e5']
 return "#"+("00000"+((Math.random()*16777215+0.5)>>0).toString(16)).slice(-6);
 } */
              width: 1, // 线条宽度
              opacity: 0.1, // 尾迹线条透明度
              curveness: 0.3 // 尾迹线条曲直度
            }
          },
          data: [
            { coords: [[120.731263, 31.33346], [120.665507, 31.392156]], lineStyle: { color: '#4ab2e5' } },
            { coords: [[120.731263, 31.33346], [120.802975, 31.366708]], lineStyle: { color: '#4fb6d2' } },
            { coords: [[120.731263, 31.33346], [120.764393, 31.185771]], lineStyle: { color: '#4fb6d2' } }

          ]
        }

        ]
      };
      this.chart.setOption(options, true);
    }
  }
};
</script>
