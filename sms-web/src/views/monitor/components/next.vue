<template>
  <div>
    <div id="mountNode"></div>
    <common-detail-right v-if="detailVisible" title="服务详情" @goBack="goBack">
      <template #item_container>
        <common-detail-item :label="item.name" v-for="item in detailData" :key="item.name">{{ item.value }}</common-detail-item>
      </template>
    </common-detail-right>
    <RealLog v-if="realLog.visible" :realLogData="realLog"></RealLog>
    <LogDownload v-if="logDownload.visible" :dialog="logDownload"></LogDownload>
  </div>
</template>
<script>
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
let vm

export default {
  components: { RealLog, LogDownload },
  data() {
    return {
      serviceData: [],
      compData: [],
      gatewayData: [],
      graph: null,
      graphData: {
        nodes: [
          {
            id: 'web-0-ins-0',
            label: '租户端',
            comboId: 'A'
          },
          {
            id: 'web-0-ins-1',
            label: '管理端',
            comboId: 'A'
          }
        ],
        // edges: [],
        edges: [
          {
            source: 'A',
            target: GATEWAY,
            style: {
              stroke: '#54c54e',
              lineWidth: 10,
              endArrow: {
                path: G6.Arrow.vee()
              }
            }
          },
          {
            source: GATEWAY,
            target: SERVICE,
            style: {
              stroke: '#54c54e',
              lineWidth: 10,
              endArrow: {
                path: G6.Arrow.vee()
              }
            }
          },
          {
            source: SERVICE,
            target: WORKER,
            type: 'cubic',
            curveOffset: -100,
            style: {
              stroke: '#54c54e',
              lineWidth: 10,
              endArrow: {
                path: G6.Arrow.vee()
              }
            }
          },
          {
            source: SERVICE,
            target: STORAGE,
            type: 'cubic',
            curveOffset: 100,
            style: {
              stroke: '#54c54e',
              lineWidth: 10,
              endArrow: {
                path: G6.Arrow.vee()
              }
            }
          }
        ],
        combos: [
          {
            id: 'A',
            anchorPoints: [[0.5, 1]],
            padding: [50, 100, 50, 100],
            style: {
              shadowColor: '#111',
              shadowBlur: 1
            }
          },
          {
            id: GATEWAY,
            anchorPoints: [
              [0.5, 0],
              [0.5, 1]
            ],
            padding: [50, 100, 50, 100],
            style: {
              shadowColor: '#111',
              shadowBlur: 1
            }
          },
          {
            id: SERVICE,
            anchorPoints: [
              [0.5, 0],
              [0.5, 1]
            ],
            style: {
              shadowColor: '#111',
              shadowBlur: 1
            }
          },
          {
            id: STORAGE,
            anchorPoints: [[0.5, 0]],
            style: {
              shadowColor: '#111',
              shadowBlur: 1
            }
          },
          {
            id: WORKER,
            anchorPoints: [[0.5, 0]],
            style: {
              shadowColor: '#111',
              shadowBlur: 1
            }
          }
        ]
      },
      realLog: {
        visible: false,
        data: {}
      },
      logDownload: {
        visible: false
      },
      detailVisible: false,
      detailData: [],
      currentInstance: {}
    }
  },
  created() {
    vm = this
  },
  async mounted() {
    this.initG6()
    await this.getGatewayData()
    await this.getServiceData()
    await this.getWorkerData()
    await this.getStorageData()
    this.drawCvs()
  },
  methods: {
    initG6() {
      this.graph = new G6.Graph({
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
          style: {
            fill: '#409eff',
            shadowColor: '#bbb',
            shadowBlur: 20
          },
          labelCfg: {
            position: 'center',
            offset: 10,
            style: {
              fill: '#fff',
              fontSize: 30
            }
          }
        },
        defaultEdge: {
          type: 'line',
          style: {
            lineWidth: 5
          }
        },
        defaultCombo: {
          type: 'rect',
          style: {
            fill: '#fff'
            // stroke: '#409eff',
            // lineWidth: 5
          }
        }
      })
    },
    async getGatewayData() {
      const { data, success } = await getGateway()
      if (success) {
        this.packData(data, GATEWAY, WEB)
      }
      return new Promise((resolve) => resolve())
    },
    async getServiceData() {
      const { data, success } = await getServices()
      if (success) {
        this.packData(data.service, SERVICE, GATEWAY)
      }
      return new Promise((resolve) => resolve())
    },
    async getStorageData() {
      const { data, success } = await getComponents()
      if (success) {
        this.packData(data, STORAGE, SERVICE)
      }
      return new Promise((resolve) => resolve())
    },
    async getWorkerData() {
      const { data, success } = await getPlugs()
      if (success) {
        this.packData(data, WORKER, SERVICE)
      }
      return new Promise((resolve) => resolve())
    },
    packData(data, sign, oldSign) {
      const edges = []
      const nodesData = []
      data.forEach((item, index) => {
        nodesData.push({
          id: `${sign}-${index}`,
          label: item.name,
          comboId: sign
        })
        if (item.instance?.length) {
          item.instance.forEach((el, idx) => {
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
              style: {
                stroke: '#444',
                radius: 50
              }
            })
          })
        }
      })
      this.graphData.nodes = [...this.graphData.nodes, ...nodesData]
      const oldChildNodes = this.graphData.nodes.filter((node) => node.id.indexOf(oldSign) > -1 && node.id.indexOf('ins') > -1)
      const newChildNodes = this.graphData.nodes.filter((node) => node.id.indexOf(sign) > -1 && node.id.indexOf('ins') <= -1)
      const oLen = oldChildNodes.length
      const nLen = newChildNodes.length
      if (oLen % 2 == 1 && nLen % 2 == 1) {
        const ol = oldChildNodes[Math.floor(oLen / 2)]
        const nl = newChildNodes[Math.floor(nLen / 2)]
        edges.push({
          source: ol.id,
          target: nl.id,
          style: {
            opacity: 0
          }
        })
      } else if (oLen % 2 == 0 && nLen % 2 == 1) {
        const ol0 = oldChildNodes[Math.floor(oLen / 2) - 1]
        const ol1 = oldChildNodes[Math.floor(oLen / 2)]
        const nl = newChildNodes[Math.floor(nLen / 2)]
        edges.push({
          source: ol0.id,
          target: nl.id,
          style: {
            opacity: 0
          }
        })
        edges.push({
          source: ol1.id,
          target: nl.id,
          style: {
            opacity: 0
          }
        })
      } else if (oLen % 2 == 1 && nLen % 2 == 0) {
        const ol = oldChildNodes[Math.floor(oLen / 2)]
        const nl0 = newChildNodes[Math.floor(nLen / 2) - 1]
        const nl1 = newChildNodes[Math.floor(nLen / 2)]
        edges.push({
          source: ol.id,
          target: nl0.id,
          style: {
            opacity: 0
          }
        })
        edges.push({
          source: ol.id,
          target: nl1.id,
          style: {
            opacity: 0
          }
        })
      } else {
        const ol0 = oldChildNodes[Math.floor(oLen / 2) - 1]
        const ol1 = oldChildNodes[Math.floor(oLen / 2)]
        const nl0 = newChildNodes[Math.floor(nLen / 2) - 1]
        const nl1 = newChildNodes[Math.floor(nLen / 2)]
        edges.push({
          source: ol0.id,
          target: nl0.id,
          style: {
            opacity: 0
          }
        })
        edges.push({
          source: ol1.id,
          target: nl1.id,
          style: {
            opacity: 0
          }
        })
      }
      this.graphData.edges = [...this.graphData.edges, ...edges]
    },
    drawCvs() {
      // this.graphData.edges.push({
      //   source: 'csc',
      //   target: 'gateway-0',
      //   style: {
      //     opacity: 0
      //   }
      // })
      // this.graphData.edges.push({
      //   source: 'cmc',
      //   target: 'gateway-0',
      //   style: {
      //     opacity: 0
      //   }
      // })
      // this.graphData.edges.push({
      //   source: 'gateway-0-ins-0',
      //   target: 'service-5',
      //   style: {
      //     opacity: 0
      //   }
      // })
      // this.graphData.edges.push({
      //   source: 'gateway-0-ins-0',
      //   target: 'service-6',
      //   style: {
      //     opacity: 0
      //   }
      // })
      // this.graphData.edges.push({
      //   source: 'service-5-ins-0',
      //   target: STORAGE + '-2',
      //   style: {
      //     opacity: 0
      //   }
      // })
      // this.graphData.edges.push({
      //   source: 'service-6-ins-0',
      //   target: STORAGE + '-3',
      //   style: {
      //     opacity: 0
      //   }
      // })
      this.graph.data(this.graphData)
      this.graph.render()
      this.graph.zoomTo(0.1)
      this.graph.on('node:mouseenter', (evt) => {
        const { item, canvasX, canvasY } = evt
        const { id } = item.getModel()
        if (/-ins-/.test(id) && !/web/.test(id)) {
          this.setDialog(item.getModel(), canvasX, canvasY)
        }
      })
      this.graph.on('node:mouseout', (evt) => {
        const dialog = document.getElementById('g6-popup')
        if (dialog) {
          dialog.style.display = 'none'
        }
      })
      this.graph.on('node:click', (evt) => {
        const { item } = evt
        const {
          id,
          instance: { host, status }
        } = item.getModel()
        if (/service-.?-ins-/.test(id) && status == 'running') {
          vm.detailVisible = true
          vm.getDetailData(host)
        }
      })
      // this.graph.on('afterlayout', e => {
      //   this.graphData.nodes.forEach(node => {
      //     node.x = node.x + 10;
      //     node.y = node.y + 10;
      //   })
      // })
    },
    setDialog(model, x, y) {
      let dialog = document.getElementById('g6-popup')
      if (!dialog) {
        dialog = document.createElement('div')
        dialog.setAttribute('id', 'g6-popup')
        dialog.style.position = 'absolute'
        document.getElementById('mountNode').append(dialog)
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
      document.getElementById('setting').addEventListener('click', (evt) => {
        vm.handleRealLog()
      })
      document.getElementById('download').addEventListener('click', (evt) => {
        vm.download()
      })
      dialog.addEventListener('mouseenter', (evt) => {
        if (/service/.test(model.id)) {
          vm.currentInstance = { ...model.instance }
        }
        dialog.style.display = 'block'
      })
      dialog.addEventListener('mouseleave', (evt) => {
        vm.currentInstance = {}
        dialog.style.display = 'none'
      })
    },
    async getDetailData(host) {
      const { data, success } = await getStatus({ value: host })
      if (success) {
        this.detailData = Object.keys(data).map((key) => ({ name: key, value: data[key] }))
      }
    },
    goBack() {
      this.detailVisible = false
    },
    download() {
      this.logDownload = {
        visible: true,
        data: Object.assign({}, this.currentInstance)
      }
    },
    handleRealLog() {
      this.realLog = {
        visible: true,
        data: this.currentInstance
      }
    }
  }
}
</script>
<style lang="scss" scoped>
#mountNode {
  width: 100%;
  height: 90vh;
  background: #fafafa;
  position: relative;
  ::v-deep .outer {
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
  ::v-deep .list {
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
