<template>
    <div :class="className" :id="id" :style="{height:height,width:width}"></div>
</template>

<script>
import mixins from '../mixins';

export default {
  mixins: [mixins],
  watch: {},
  data () {
    return {
      chart: null
    };
  },
  mounted () {
    this.eveSet();
  },
  methods: {
    // 隐藏右键操作
    hideOperate () {
      const targetArr = document.getElementsByClassName('operate-node-menu');
      for (const item of targetArr) {
        item.style.display = 'none';
      }
    },
    // 对画布绑定事件
    eveSet () {
      this.chart.on('mouseup', (params) => {
        if (params.dataType == 'edge') return;
        const event = params.event.event;
        event.stopPropagation();
        if (event.button == 2) {
          this.hideOperate();
          this.$emit('mouseup', params);
        }
      });
      const self = this;
      document.addEventListener('click', function (event) {
        event.stopPropagation();
        self.hideOperate();
      });
      document.oncontextmenu = function () {
        return false;
      };
    },
    updateChart () {
      const options = {
        animationDuration: 100,
        animationDurationUpdate: 300,
        animationEasingUpdate: 'quinticInOut',
        toolbox: this.setting.toolbox,
        series: [
          {
            type: 'graph',
            layout: 'force',
            draggable: true,
            symbolSize: 50,
            roam: true, // 禁止用鼠标滚轮缩小放大效果
            edgeSymbol: ['circle', 'none'],
            edgeSymbolSize: [0, 10],
            focusNodeAdjacency: true, // 划过只显示对应关系
            lineStyle: {
              normal: {
                opacity: 1,
                width: 1,
                curveness: 0
              }
            },
            label: {
              normal: {
                position: this.setting.labelPosition || 'bottom',
                show: true,
                textStyle: {
                  fontSize: 12
                }
              }
            },
            force: {
              layoutAnimation: true, // 是否关闭力导向布局动画
              repulsion: [1000, 1200], // 节点的斥力因子
              edgeLength: [150, 200]// 节点之间的距离
            },
            edgeLabel: {
              normal: {
                show: true,
                textStyle: {
                  fontSize: 12
                },
                formatter: '{c}',
                backgroundColor: '#fff',
                padding: 5,
                color: '#4b59fd',
                borderRadius: 3
              }
            },
            data: this.data.nodes,
            links: this.data.links
          }
        ]
      };
      this.chart.setOption(options, true);
    }
  }
};
</script>
