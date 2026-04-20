<template>
  <div id="mountNode" style="height: 100%; width: 100%"></div>
</template>

<script>
import G6 from '@antv/g6';
import registerDefault from './registerDefault';

export default {
  props: {
    defaultEdgeType: {
      type: String
    },
    defaultNodeType: {
      type: String,
      default: 'circle'
    },
    // 拓扑的配置
    options: {
      type: Object,
      default: function() {
        return {};
      }
    },
    data: {
      type: Object,
      default: function() {
        return {};
      }
    },
    layout: {
      type: Object
    }
  },
  data() {
    return {
      graph: null,
      currentLayout: ''
    };
  },
  created() {
    registerDefault(G6, this.defaultNodeType, this.defaultEdgeType);
  },
  mounted() {
    this.initGraph();
    window.addEventListener('resize', this.changeSize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.changeSize);
  },
  watch: {
    data() {
      if (this.graph) {
        this.graph.changeData(this.data);
      }
    }
  },
  methods: {
    initGraph() {
      const target = document.getElementById('mountNode');
      // const minimap = new G6.Minimap(this.minimapConfig);
      // 实例化 grid 插件
      const options = {
        // plugins: [grid], // 将 minimap 实例配置到图上
        modes: {
          default: [
            'drag-canvas',
            'zoom-canvas',
            'drag-node',
            'drag-combo'
            // {
            //   type: 'tooltip', // 提示框
            //   formatText:
            //     this.tipFormat ||
            //     function(model) {
            //       // 提示框文本内容
            //       const text = [];
            //       text.push(`<div>${model.label}</div>`);
            //       return text.join('');
            //     },
            //   offset: 60
            // }
          ] // 允许拖拽画布、放缩画布、拖拽节点
        },
        // fitCenter: true,
        container: 'mountNode', // String | HTMLElement，必须，在 Step 1 中创建的容器 id 或容器本身
        width: target.offsetWidth, // Number，必须，图的宽度
        height: target.offsetHeight, // Number，必须，图的高度
        defaultNode: {
          type: 'image',
          size: [60],
          color: '#ffffff',
          style: {
            fill: '#9EC9FF',
            lineWidth: 1
          },
          labelCfg: {
            style: {
              fill: '#ffffff',
              fontSize: 12
            },
            position: 'bottom'
          }
        },
        defaultEdge: {
          type: 'circle-running',
          style: {
            stroke: '#7ECEF4',
            lineWidth: 2
          }
        },
        groupByTypes: false,
        defaultCombo: {
          type: 'rect',
          padding: [40, 40, 40, 40],
          style: {
            fill: '#112A51',
            stroke: '#112A51',
            radius: 4
          },
          labelCfg: {
            refY: 20,
            refX: 20,
            position: 'top',
            style: {
              fill: '#ffffff',
              fontSize: 15
            }
          }
        },
        layout: this.layout
      };
      const graph = new G6.Graph(options);
      this.graph = graph;
      graph.read(this.data);
      this.bindEvent();
    },
    save () {
      const data = this.graph.save();
      return data;
    },
    itemClick(evt, type) {
      const { clientX, clientY, item } = evt;
      const params = {
        x: clientX, y: clientY, item: item.getModel()
      }
      this.$emit(type, params)
    },
    bindEvent() {
      this.graph.on('node:click', evt => {
        this.itemClick(evt, 'nodeClick')
      });
      this.graph.on('edge:click', evt => {
        this.itemClick(evt, 'edgeClick')
      });
      this.graph.on('canvas:click', evt => {
        this.$emit('canvasClick')
      });
    },
    changeSize() {
      setTimeout(() => {
        const target = document.getElementById('mountNode');
        const width = target.offsetWidth;
        const height = target.offsetHeight;
        this.graph.changeSize(width, height);
      }, 1000);
    }
  }
};
</script>
<style lang="scss">
</style>
