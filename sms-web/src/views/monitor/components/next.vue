<template>
  <div>
    <div id="mountNode"></div>
    <!-- TODO: cmp-element -->
    <common-detail-right v-if="detailVisible" title="服务详情" @goBack="goBack">
      <template #item_container>
        <!-- TODO: cmp-element -->
        <common-detail-item :label="item.name" v-for="item in detailData" :key="item.name">{{ item.value }}</common-detail-item>
      </template>
    </common-detail-right>
    <RealLog v-if="realLog.visible" :realLogData="realLog"></RealLog>
    <LogDownload v-if="logDownload.visible" :dialog="logDownload"></LogDownload>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
// TODO: type - @antv/g6 类型依赖需要补充声明
import G6 from '@antv/g6/dist/g6.min'
import RealLog from './realLog.vue'
import LogDownload from './logDownload.vue'
import { getServices, getComponents, getGateway, getStatus, getPlugs } from 'services/system/service_system'
import setting from '@/assets/setting.png'
import download from '@/assets/download.png'

const WEB = 'web'
const SERVICE = 'service'
const GATEWAY = 'gateway'
const STORAGE = 'storage'
const WORKER = 'worker'

interface GraphNode {
  id: string
  label?: string
  comboId?: string
  type?: string
  size?: number[]
  anchorPoints?: number[][]
  style?: Record<string, unknown>
  instance?: Record<string, any>
}

interface GraphEdge {
  source: string
  target: string
  type?: string
  curveOffset?: number
  style?: Record<string, unknown>
}

interface GraphCombo {
  id: string
  anchorPoints?: number[][]
  padding?: number[]
  style?: Record<string, unknown>
}

interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
  combos: GraphCombo[]
}

// TODO: type - G6 Graph 类型缺失
const graph = ref<any>(null)
const detailVisible = ref(false)
const detailData = ref<Array<{ name: string; value: unknown }>>([])
const currentInstance = ref<Record<string, any>>({})
const realLog = reactive<{ visible: boolean; data: Record<string, unknown> }>({ visible: false, data: {} })
const logDownload = reactive<{ visible: boolean; data?: Record<string, unknown> }>({ visible: false })

const graphData: GraphData = {
  nodes: [
    { id: 'web-0-ins-0', label: '租户端', comboId: 'A' },
    { id: 'web-0-ins-1', label: '管理端', comboId: 'A' }
  ],
  edges: [
    {
      source: 'A',
      target: GATEWAY,
      style: { stroke: '#54c54e', lineWidth: 10, endArrow: { path: G6.Arrow.vee() } }
    },
    {
      source: GATEWAY,
      target: SERVICE,
      style: { stroke: '#54c54e', lineWidth: 10, endArrow: { path: G6.Arrow.vee() } }
    },
    {
      source: SERVICE,
      target: WORKER,
      type: 'cubic',
      curveOffset: -100,
      style: { stroke: '#54c54e', lineWidth: 10, endArrow: { path: G6.Arrow.vee() } }
    },
    {
      source: SERVICE,
      target: STORAGE,
      type: 'cubic',
      curveOffset: 100,
      style: { stroke: '#54c54e', lineWidth: 10, endArrow: { path: G6.Arrow.vee() } }
    }
  ],
  combos: [
    {
      id: 'A',
      anchorPoints: [[0.5, 1]],
      padding: [50, 100, 50, 100],
      style: { shadowColor: '#111', shadowBlur: 1 }
    },
    {
      id: GATEWAY,
      anchorPoints: [
        [0.5, 0],
        [0.5, 1]
      ],
      padding: [50, 100, 50, 100],
      style: { shadowColor: '#111', shadowBlur: 1 }
    },
    {
      id: SERVICE,
      anchorPoints: [
        [0.5, 0],
        [0.5, 1]
      ],
      style: { shadowColor: '#111', shadowBlur: 1 }
    },
    {
      id: STORAGE,
      anchorPoints: [[0.5, 0]],
      style: { shadowColor: '#111', shadowBlur: 1 }
    },
    {
      id: WORKER,
      anchorPoints: [[0.5, 0]],
      style: { shadowColor: '#111', shadowBlur: 1 }
    }
  ]
}

function initG6(): void {
  graph.value = new G6.Graph({
    container: 'mountNode',
    fitView: true,
    fitViewPadding: 100,
    groupByTypes: false,
    layout: {
      type: 'dagre',
      rankDir: 'TB',
      sortByCombo: true,
      ranksep: 50,
      nodesep: 20
    },
    modes: {
      default: ['drag-canvas', 'zoom-canvas'],
      edit: ['click-select']
    },
    defaultNode: {
      type: 'rect',
      anchorPoints: [[0.5, 1]],
      size: [200, 70],
      style: { fill: '#409eff', shadowColor: '#bbb', shadowBlur: 20 },
      labelCfg: {
        position: 'center',
        offset: 10,
        style: { fill: '#fff', fontSize: 30 }
      }
    },
    defaultEdge: {
      type: 'line',
      style: { lineWidth: 5 }
    },
    defaultCombo: {
      type: 'rect',
      style: { fill: '#fff' }
    }
  })
}

function packData(data: any[], sign: string, oldSign: string): void {
  const edges: GraphEdge[] = []
  const nodesData: GraphNode[] = []
  data.forEach((item: any, index: number) => {
    nodesData.push({
      id: `${sign}-${index}`,
      label: item.name,
      comboId: sign
    })
    if (item.instance?.length) {
      item.instance.forEach((el: any, idx: number) => {
        nodesData.push({
          id: `${sign}-${index}-ins-${idx}`,
          type: 'cycle',
          comboId: sign,
          size: [80, 80],
          anchorPoints: [
            [0.5, 0],
            [0.5, 1]
          ],
          style: {
            fill: ['true', 'running'].includes(el.status) ? '#54c54e' : '#ff0000',
            stroke: '#eaff8f',
            lineWidth: 5,
            shadowColor: '#bbb',
            shadowBlur: 20
          },
          instance: el
        })
        edges.push({
          source: `${sign}-${index}`,
          target: `${sign}-${index}-ins-${idx}`,
          type: 'polyline',
          style: { stroke: '#444', radius: 50 }
        })
      })
    }
  })
  graphData.nodes = [...graphData.nodes, ...nodesData]
  const oldChildNodes = graphData.nodes.filter((node) => node.id.indexOf(oldSign) > -1 && node.id.indexOf('ins') > -1)
  const newChildNodes = graphData.nodes.filter((node) => node.id.indexOf(sign) > -1 && node.id.indexOf('ins') <= -1)
  const oLen = oldChildNodes.length
  const nLen = newChildNodes.length
  if (oLen % 2 == 1 && nLen % 2 == 1) {
    const ol = oldChildNodes[Math.floor(oLen / 2)]
    const nl = newChildNodes[Math.floor(nLen / 2)]
    edges.push({ source: ol.id, target: nl.id, style: { opacity: 0 } })
  } else if (oLen % 2 == 0 && nLen % 2 == 1) {
    const ol0 = oldChildNodes[Math.floor(oLen / 2) - 1]
    const ol1 = oldChildNodes[Math.floor(oLen / 2)]
    const nl = newChildNodes[Math.floor(nLen / 2)]
    edges.push({ source: ol0.id, target: nl.id, style: { opacity: 0 } })
    edges.push({ source: ol1.id, target: nl.id, style: { opacity: 0 } })
  } else if (oLen % 2 == 1 && nLen % 2 == 0) {
    const ol = oldChildNodes[Math.floor(oLen / 2)]
    const nl0 = newChildNodes[Math.floor(nLen / 2) - 1]
    const nl1 = newChildNodes[Math.floor(nLen / 2)]
    edges.push({ source: ol.id, target: nl0.id, style: { opacity: 0 } })
    edges.push({ source: ol.id, target: nl1.id, style: { opacity: 0 } })
  } else {
    const ol0 = oldChildNodes[Math.floor(oLen / 2) - 1]
    const ol1 = oldChildNodes[Math.floor(oLen / 2)]
    const nl0 = newChildNodes[Math.floor(nLen / 2) - 1]
    const nl1 = newChildNodes[Math.floor(nLen / 2)]
    edges.push({ source: ol0.id, target: nl0.id, style: { opacity: 0 } })
    edges.push({ source: ol1.id, target: nl1.id, style: { opacity: 0 } })
  }
  graphData.edges = [...graphData.edges, ...edges]
}

async function getGatewayData(): Promise<void> {
  const { data, success } = await getGateway()
  if (success) {
    packData(data, GATEWAY, WEB)
  }
}

async function getServiceData(): Promise<void> {
  const { data, success } = await getServices()
  if (success) {
    packData(data.service, SERVICE, GATEWAY)
  }
}

async function getStorageData(): Promise<void> {
  const { data, success } = await getComponents()
  if (success) {
    packData(data, STORAGE, SERVICE)
  }
}

async function getWorkerData(): Promise<void> {
  const { data, success } = await getPlugs()
  if (success) {
    packData(data, WORKER, SERVICE)
  }
}

async function getDetailData(host: string): Promise<void> {
  const { data, success } = await getStatus({ value: host })
  if (success) {
    detailData.value = Object.keys(data).map((key) => ({ name: key, value: data[key] }))
  }
}

function goBack(): void {
  detailVisible.value = false
}

function handleDownload(): void {
  logDownload.visible = true
  logDownload.data = { ...currentInstance.value }
}

function handleRealLog(): void {
  realLog.visible = true
  realLog.data = currentInstance.value
}

function setDialog(model: any, x: number, y: number): void {
  let dialog = document.getElementById('g6-popup')
  if (!dialog) {
    dialog = document.createElement('div')
    dialog.setAttribute('id', 'g6-popup')
    dialog.style.position = 'absolute'
    document.getElementById('mountNode')?.append(dialog)
  }
  dialog.style.display = 'block'
  dialog.style.left = x + 2 + 'px'
  dialog.style.top = y + 2 + 'px'
  dialog.innerHTML = `
        <div
          class="outer"
          style="border: solid 2px ${['true', 'running'].includes(model.instance?.status) ? '#54c54e' : '#ff0000'};">
          <div class="img" style="display: ${/service/.test(model.id) ? 'block' : 'none'}">
            <img src="${setting}" title="实时日志" id="setting">
            <img src="${download}" title="日志下载" id="download">
          </div>
          <p style="color:${['true', 'running'].includes(model.instance?.status) ? '#54c54e' : '#ff0000'}">${model.instance?.host ?? ''}</p>
          ${
  /service/.test(model.id)
    ? `<div class='list'>
        <span>CPU</span>
        <div>
          <div style="width: ${model.instance.cpuUsed || 0}%"></div>
        </div>
        <span>${model.instance.cpuUsed ? model.instance.cpuUsed + '%' : ''}</span>
      </div>
      <div class='list'>
        <span>内存</span>
        <div>
          <div style="width: ${model.instance.memUsed || 0}%"></div>
        </div>
        <span>${model.instance.memUsed ? model.instance.memUsed + '%' : ''}</span>
      </div>`
    : `<div>
<p>主节点：${model.instance.master ? '是' : '否'}</p>
      </div>`
}
        </div>
      `
  document.getElementById('setting')?.addEventListener('click', () => {
    handleRealLog()
  })
  document.getElementById('download')?.addEventListener('click', () => {
    handleDownload()
  })
  dialog.addEventListener('mouseenter', () => {
    if (/service/.test(model.id)) {
      currentInstance.value = { ...model.instance }
    }
    if (dialog) dialog.style.display = 'block'
  })
  dialog.addEventListener('mouseleave', () => {
    currentInstance.value = {}
    if (dialog) dialog.style.display = 'none'
  })
}

function drawCvs(): void {
  graph.value.data(graphData)
  graph.value.render()
  graph.value.zoomTo(0.1)
  graph.value.on('node:mouseenter', (evt: any) => {
    const { item, canvasX, canvasY } = evt
    const { id } = item.getModel()
    if (/-ins-/.test(id) && !/web/.test(id)) {
      setDialog(item.getModel(), canvasX, canvasY)
    }
  })
  graph.value.on('node:mouseout', () => {
    const dialog = document.getElementById('g6-popup')
    if (dialog) {
      dialog.style.display = 'none'
    }
  })
  graph.value.on('node:click', (evt: any) => {
    const { item } = evt
    const {
      id,
      instance: { host, status }
    } = item.getModel()
    if (/service-.?-ins-/.test(id) && status == 'running') {
      detailVisible.value = true
      getDetailData(host)
    }
  })
}

onMounted(async () => {
  initG6()
  await getGatewayData()
  await getServiceData()
  await getWorkerData()
  await getStorageData()
  drawCvs()
})
</script>

<style lang="scss" scoped>
#mountNode {
  width: 100%;
  height: 90vh;
  background: #fafafa;
  position: relative;
  :deep(.outer) {
    width: 220px;
    height: 120px;
    padding: 10px;
    background: white;
    border-radius: 5px;
    position: relative;
    & > .img {
      position: absolute;
      right: 10px;
      top: 8px;
      img {
        width: 15px;
        height: 15px;
        margin: 0 5px;
        cursor: pointer;
      }
    }
  }
  :deep(.list) {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 5px;
    & > div {
      width: 100px;
      height: 10px;
      margin: 0 5px;
      border-radius: 10px;
      background: #eee;
      & > div {
        height: 100%;
        background: #54c54e;
        border-radius: 10px;
      }
    }
  }
}
</style>
