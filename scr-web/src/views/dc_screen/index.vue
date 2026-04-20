<template>
  <ScreenWrapper title="/scr-web/static/img/dc/title.png" :loading="loading">
    <OverviewState :configs="overviewConfigs"></OverviewState>
    <el-row class="m-t-md">
      <el-col :span="8" class="left">
        <div class="card">
          <div class="card-title">数据中心设备概况</div>
          <div class="card-body">
            <scroll-table :data="dcData" :column-width="['100px']" :columns="['数据中心名称','机柜','服务器', '存储', '网络设备']" :options="{singleHeight: 40, limitMoveNum: 8}">
              <template v-slot="scope">
                <scroll-table-column :value="scope.row.name" width="100px">
                </scroll-table-column>
                <scroll-table-column :value="scope.row.racks">
                </scroll-table-column>
                <scroll-table-column :value="scope.row.servers">
                </scroll-table-column>
                <scroll-table-column :value="scope.row.storage">
                </scroll-table-column>
                <scroll-table-column :value="scope.row.networks">
                </scroll-table-column>
              </template>
            </scroll-table>
          </div>
        </div>
        <div class="card">
          <div class="card-title">数据中心资源使用趋势</div>
          <div class="card-body">
            <line-charts :data="resourceTrend" v-if="resourceTrend.keys" width="100%" height="340px"></line-charts>
          </div>
        </div>
      </el-col>
      <el-col :span="8" class="center">
        <dv-flyline-chart-enhanced :config="mapConfigs" :dev="true" style="width:100%;height:800px;background-size: 100% 100%;" />
      </el-col>
      <el-col :span="8" class="right">
        <div class="card">
          <div class="card-title">数据中心资源概况</div>
          <div class="card-body">
            <scroll-table :data="dcItemData"  :column-width="['80px', '', '85px']" :columns="['集群名称', 'CPU核数' , '计算能力(GHz)' , '内存(TB)' , '存储(TB)' , '云主机数' ]" :options="{singleHeight: 40, limitMoveNum: 8}">
              <template v-slot="scope">
                <scroll-table-column :value="scope.row.name" width="80px">
                </scroll-table-column>
                <scroll-table-column :value="scope.row.cpuCore">
                </scroll-table-column>
                <scroll-table-column :value="scope.row.cpuTotal" width="85px">
                </scroll-table-column>
                <scroll-table-column :value="scope.row.memTotal">
                </scroll-table-column>
                <scroll-table-column :value="scope.row.storage">
                </scroll-table-column>
                <scroll-table-column :value="scope.row.servers">
                </scroll-table-column>
              </template>
            </scroll-table>
          </div>
        </div>
        <div class="card">
          <div class="card-title">链路资源概况</div>
          <div class="card-body">
            <loop-charts :data="linkData" :setting="{center: ['50%', '33%']}" v-if="linkData.length" width="100%" height="340px" center-text="链路总数" theme="链路资源"></loop-charts>
          </div>
        </div>
      </el-col>
    </el-row>
  </ScreenWrapper>
</template>

<script setup lang="ts">
import { reactive, toRefs, onUnmounted } from 'vue'
import ScreenWrapper from 'components/ScreenWrapper/index.vue'
import OverviewState from 'components/OverviewState/index.vue'
import { overviewConfigs } from './data'
import {
  getDcList,
  getOverview,
  getUsed,
  getDcOverview,
  getDcItem,
  getDcResource,
  getDcLink
} from 'services/screen/dc'

interface MapPoint {
  name: string
  id: number
  coordinate: number[]
  icon?: { src: string; width: number; height: number }
  text?: { fontSize: number; color: string; offset: number[] }
}

interface MapLine {
  source: string
  target: string
  width: number
}

interface MapData {
  points: MapPoint[]
  lines: MapLine[]
  [key: string]: unknown
}

// 处理map数据
const handleMapData = (data: Record<string, unknown>, dcId: number) => {
  const { points = [], lines = [] } = data as { points: Array<Record<string, unknown>>; lines: Array<Record<string, unknown>> }
  return {
    points: points.map((item) => {
      const { id, name, position, leader } = item as { id: number; name: string; position: string; leader: boolean }
      const obj: Record<string, unknown> = {
        name,
        id,
        coordinate: JSON.parse(position)
      }
      if (id === dcId) {
        obj.icon = {
          src: '/scr-web/static/img/dc/mapCenterPoint.png',
          width: 90,
          height: 90
        }
      }
      if (leader) {
        obj.text = {
          fontSize: 18,
          color: '#42edf8',
          offset: [0, 25]
        }
      }
      return obj
    }),
    lines: lines.map((item) => {
      const { source, target, weight } = item as { source: string; target: string; weight: number }
      return {
        source,
        target,
        width: weight ? 5 : 2
      }
    }),
    icon: {
      show: true,
      src: '/scr-web/static/img/dc/icon.png',
      width: 100,
      height: 470
    },
    text: {
      show: true,
      color: '#fff'
    },
    k: 0.5,
    line: {
      width: 3,
      color: '#7bf4ff'
    },
    halo: {
      show: true,
      radius: 80,
      color: '#7BF4FF'
    },
    bgImgSrc: '/scr-web/static/img/dc/map.png'
  }
}

const state = reactive({
  overviewConfigs,
  dcData: [] as Record<string, unknown>[],
  dcItemData: [] as Record<string, unknown>[],
  resourceTrend: {} as Record<string, unknown>,
  linkData: {} as Record<string, unknown>,
  mapConfigs: {} as Record<string, unknown>,
  loading: true
})

const { overviewConfigs: _oc, dcData, dcItemData, resourceTrend, linkData, mapConfigs, loading } = toRefs(state)

let dcIndex = -1
let dcId = 0
const timer = setInterval(() => {
  const { points } = state.mapConfigs as { points: Array<{ id: number }> }
  dcIndex = dcIndex === points.length - 1 ? 0 : dcIndex + 1
  dcId = points[dcIndex].id
  change()
  state.mapConfigs = handleMapData(mapData, dcId)
}, 1000 * 20)

onUnmounted(() => {
  clearInterval(timer)
})

// 数据中心
let mapData: Record<string, unknown> = {}
const getDc = async () => {
  const res = await getDcList()
  if (res.success) {
    mapData = res.data
    state.mapConfigs = handleMapData(mapData, dcId)
  }
}

// 总体情况
const getOverviewState = async () => {
  const res = await getOverview(dcId)
  if (res.success) {
    const { serverNumber, vmsNumber, onlineNumber, link } = res.data
    const unit = state.overviewConfigs[0]
    ;[serverNumber, vmsNumber, onlineNumber, link].forEach(
      (item: number, index: number) => {
        unit.data[index].value = item
      }
    )
  }
}

// 使用情况
const getUsedState = async () => {
  const res = await getUsed(dcId)
  if (res.success) {
    const {
      menUnused,
      memTotal,
      cpuUnused,
      cpuTotal,
      diskUnused,
      diskTotal
    } = res.data
    const unit = state.overviewConfigs[1]
    ;[
      { used: cpuUnused, total: cpuTotal },
      { used: menUnused, total: memTotal },
      { used: diskUnused, total: diskTotal }
    ].forEach((item, index) => {
      unit.data[index].used = item.used
      unit.data[index].total = item.total
    })
  }
}

// 数据中心概况
const getDcState = async () => {
  const res = await getDcOverview()
  if (res.success) {
    state.dcData = res.data
  }
}

const getDcItemState = async () => {
  const res = await getDcItem(dcId)
  if (res.success) {
    state.dcItemData = res.data
  }
}

// 使用趋势
const getResourceTrend = async () => {
  const res = await getDcResource(dcId)
  if (res.success) {
    state.resourceTrend = res.data
  }
}

// 存储
const getLink = async () => {
  const res = await getDcLink(dcId)
  if (res.success) {
    state.linkData = res.data
  }
}

// 切换数据中心
const change = async () => {
  await Promise.all([
    getOverviewState(),
    getUsedState(),
    getDcItemState(),
    getResourceTrend(),
    getLink()
  ])
}

const init = async () => {
  await Promise.all([getDc(), getDcState(), change()])
  state.loading = false
}
init()
</script>
<style lang="scss" scoped>
.left,
.right {
  width: 27%;
}
.center {
  width: 46%;
}
:deep() {
  .dv-scroll-board .header,
  .row-item {
    font-size: 12px;
  }
}
.card {
  height: 400px;
  .card-title {
    font-size: 18px;
    border-left: 3px solid #0089ff;
    font-weight: bold;
    color: #bbefff;
    padding-left: 5px;
    margin-bottom: 20px;
  }
  .card-body{
    height: 350px;
  }
}
</style>
