<template>
  <div class="full">
    <ScreenTopology ref="graphRef" :data="data" v-if="data.nodes" defaultEdgeType="cubic-vertical" @nodeClick="nodeClick" @edgeClick="edgeClick" @canvasClick="closeInfo"></ScreenTopology>
    <div class="hover-container" :style="itemStyle">
      <div class="node-panel" v-if="currentItem.itemType === 'node'">
        <el-row>
          <el-col :span="8">IP：{{currentItem.ip}}</el-col>
          <el-col :span="8">设备名称：{{currentItem.name}}</el-col>
          <el-col :span="8">当前状态：{{currentItem.health}}</el-col>
        </el-row>
        <el-row v-if="currentItem.cpu">
          <el-col :span="12">
            <GaugeCharts :data="[{name: 'CPU利用率',  value: currentItem.cpu}]" width="100%" height="300px"></GaugeCharts>
          </el-col>
          <el-col :span="12">
            <GaugeCharts :data="[{name: '内存利用率',  value: currentItem.mem}]" width="100%" height="300px"></GaugeCharts>
          </el-col>
        </el-row>
        <div v-else class="no-data">未采集</div>
      </div>
      <div class="link-panel" v-else>
        <div class="link-panel-item">
          <span class="link-panel-name">链路名称：</span>
          <span class="link-panel-value">{{currentItem.name}}</span>
        </div>
        <div class="link-panel-item">
          <span class="link-panel-name">上行链路带宽：</span>
          <span class="link-panel-value">{{currentItem.inSpeed}}</span>
        </div>
        <div class="link-panel-item">
          <span class="link-panel-name">下行链路带宽：</span>
          <span class="link-panel-value">{{currentItem.name}}</span>
        </div>
        <div class="link-panel-item">
          <span class="link-panel-name">链路状态：</span>
          <span class="link-panel-value">{{statusFilter(currentItem.status)}}</span>
        </div>
        <div class="link-panel-item">
          <span class="link-panel-name">源设备名称：</span>
          <span class="link-panel-value">{{currentItem.srcDeviceName}}</span>
        </div>
        <!-- <div class="link-panel-item">
          <span class="link-panel-name">源设备IP：</span>
          <span class="link-panel-value">{{currentItem.srcDeviceName}}</span>
        </div> -->
        <div class="link-panel-item">
          <span class="link-panel-name">源端口名称：</span>
          <span class="link-panel-value">{{currentItem.srcIfUniqueName}}</span>
        </div>
        <div class="link-panel-item">
          <span class="link-panel-name">目的设备名称：</span>
          <span class="link-panel-value">{{currentItem.destDeviceName}}</span>
        </div>
        <!-- <div class="link-panel-item">
          <span class="link-panel-name">目的设备IP：</span>
          <span class="link-panel-value">{{currentItem.srcDeviceName}}</span>
        </div> -->
        <div class="link-panel-item">
          <span class="link-panel-name">目的端口名称：</span>
          <span class="link-panel-value">{{currentItem.destInterfaceName}}</span>
        </div>
        <div class="link-panel-item">
          <span class="link-panel-name">上行流量：</span>
          <span class="link-panel-value">{{currentItem.inFlow}}</span>
        </div>
        <div class="link-panel-item">
          <span class="link-panel-name">下行流量：</span>
          <span class="link-panel-value">{{currentItem.outFlow}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getTopoloy,
  getNodeDetail,
  getLinkDetail
} from 'services/screen/business_network'
import G6 from '@antv/g6'
import { computed, reactive, toRefs, ref } from '@vue/composition-api'
import ScreenTopology from 'components/Topology'
import GaugeCharts from 'components/echarts/gauge-charts/GaugeCharts.vue'
// import data from './test'

const registerNode = () => {
  G6.registerNode(
    'image-alarm',
    {
      afterDraw(cfg, group) {
        const alarmNode = group.addShape('image', {
          attrs: {
            x: 0,
            y: -70,
            width: 60,
            height: 60,
            img: cfg.alarmImg
          }
        })
        alarmNode.animate(
          {
            opacity: 0
          },
          {
            duration: 1000 * 1,
            easing: 'easeCubic',
            delay: 0,
            repeat: true // repeat
          }
        )
      }
    },
    'image'
  )
}
registerNode()
function handleData(data) {
  const {
    nodes: sourceNodes = [],
    edges: sourceEdges = [],
    combos: sourceCombos = []
  } = data
  const nodes = []
  const edges = []
  const combos = []
  const deviceMap = {}
  sourceNodes.forEach((item) => {
    const { name, alarmLevel, deviceType = 'switch' } = item
    const result = {
      ...item,
      label: name,
      type: 'image',
      img: `/scr-web/static/img/network/${deviceMap[deviceType] || 'switch'}.png`
    }
    if (alarmLevel) {
      result.alarmImg = `/scr-web/static/img/network/${alarmLevel}.svg`
      result.type = 'image-alarm'
    }
    nodes.push(result)
  })
  sourceEdges.forEach((item) => {
    edges.push({
      data: item,
      source: item.source.toString(),
      target: item.target.toString()
    })
  })
  sourceCombos.forEach((item) => {
    const config = {
      padding: [20, 20, 20, 20],
      style: {
        fill: '#292E30',
        stroke: '#112A51',
        fillOpacity: 0.5,
        radius: 4
      },
      labelCfg: {
        refY: -10,
        refX: 20,
        position: 'bottom',
        style: {
          fill: '#ffffff',
          fontSize: 20
        }
      }
    }
    let obj = {
      type: 'rect',
      ...item
    }
    if (obj.main) {
      obj = {
        ...obj,
        ...config
      }
    }
    combos.push(obj)
  })
  return { nodes, edges, combos }
}
function statusFilter(val) {
  const map = {
    1: '正常',
    2: '断开',
    3: '测试',
    0: '未知'
  };
  return map[val]
}
export default {
  components: { ScreenTopology, GaugeCharts },
  setup(props, context) {
    const state = reactive({
      data: {},
      currentItem: {},
      itemStyle: {}
    })
    const graphRef = ref(null)
    const getData = () => {
      const { nodes, edges, combos } = graphRef.value.save()
      const res = {
        nodes: [],
        edges: [],
        combos: []
      }
      nodes.forEach((item) => {
        const { id, label, x, y, comboId } = item
        res.nodes.push({
          id,
          label,
          x,
          y,
          comboId
        })
      })
      edges.forEach((item) => {
        const { source, target } = item
        res.edges.push({
          source,
          target
        })
      })
      combos.forEach((item) => {
        const { id, label, parentId, main } = item
        res.combos.push({
          id,
          label,
          parentId,
          main
        })
      })
    }
    const showInfo = (config) => {
      const { x, y, item } = config
      let left = x
      let top = y
      if (x + 600 > window.innerWidth) {
        left = window.innerWidth - 600
      }
      if (y + 300 > window.innerHeight) {
        top = window.innerHeight - 300
      }
      state.itemStyle = {
        display: 'block',
        left: left + 'px',
        top: top + 'px'
      }
    }
    const name = context.root.$route.query.name
    const nodeClick = async (config) => {
      showInfo(config)
      state.currentItem = {
        itemType: 'node'
      }
      const res = await getNodeDetail(config.item.infoId, name);
      if (res.success) {
        state.currentItem = {
          itemType: 'node',
          ...res.data
        }
      }
    }
    const edgeClick = async (config) => {
      showInfo(config)
      state.currentItem = {
        itemType: 'edge'
      }
      const res = await getLinkDetail(config.item.data.id, name)
      state.currentItem = {
        itemType: 'edge',
        ...res.data
      }
    }
    const closeInfo = () => {
      state.itemStyle.display = 'none'
    }
    const getTopologyData = async () => {
      const res = await getTopoloy(context.root.$route.query.name)
      state.data = handleData(res.data)
      // setTimeout(() => {
      //   if (graphRef.value.graph) {
      //     // graphRef.value.graph.fitCenter()
      //   }
      // })
    }
    getTopologyData()
    return {
      ...toRefs(state),
      graphRef,
      statusFilter,
      getData,
      nodeClick,
      edgeClick,
      closeInfo
    }
  }
}
</script>
<style lang="scss" scoped>
.full {
  width: 100%;
  height: 100%;
}
.no-data {
  text-align: center;
  font-weight: 600;
  font-size: 30px;
  min-height: 200px;
  line-height: 200px;
}
.hover-container {
  display: none;
  position: fixed;
}
.node-panel {
  height: 300px;
  width: 600px;
  padding: 20px;
  background: #0c1939;
  border: 1px solid #17264b;
  color: #fff;
}
.link-panel {
  width: 400px;
  border: 1px solid #03429b;
  border-bottom: none;
  .link-panel-item {
    background: #0a356b;
    border-bottom: 1px solid #043d8c;
    display: flex;
    font-weight: bold;
    .link-panel-name {
      padding: 8px;
      width: 100px;
      color: #fff;
      border-right: 1px solid #043d8c;
      text-align: right;
    }
    .link-panel-value {
      padding: 8px;
      color: #04ae76;
    }
  }
}
</style>
