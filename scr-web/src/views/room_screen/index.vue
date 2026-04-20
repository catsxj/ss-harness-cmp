<template>
  <ScreenWrapper title="/scr-web/static/img/room/title.png" :loading="loading" @getScale="getScale">
    <el-row class="m-t-md" :gutter="20">
      <el-col :span="8" class="left">
        <div class="card m-b">
          <div class="card-title">设备信息</div>
          <div class="card-body">
            <bar-charts :setting="{showSeriesLabel: false, showLegend: true}" :data="deviceCount" v-if="deviceCount.keys" width="100%" height="100%"></bar-charts>
          </div>
        </div>
        <div class="card  m-b">
          <div class="card-title">告警次数统计</div>
          <div class="card-body">
            <loop-charts :data="alarmCount" :setting="dcInfoConfigs" v-if="alarmCount.length" width="100%" height="100%" center-text="总数"></loop-charts>
          </div>
        </div>
        <div class="card">
          <div class="card-title">服务器资源利用率TOP10
            <el-radio-group v-model="deviceTopType" class="card-operate" @change="getServerTop10">
              <el-radio-button label="cpu" size="small">CPU</el-radio-button>
              <el-radio-button label="mem" size="small">内存</el-radio-button>
            </el-radio-group>
          </div>
          <div class="card-body">
            <bar-reverse-charts :setting="{ yAxisLabel: {rotate: 35}, showXAxis: false}" :data="serverTop10" v-if="serverTop10.keys" width="100%" height="100%" unit="%"></bar-reverse-charts>
          </div>
        </div>
      </el-col>
      <el-col :span="8" class="center">
        <OverviewState :configs="overviewConfigs" style="margin: 0"></OverviewState>
        <el-carousel :interval="interval" @change="changeRoom" indicator-position="none">
          <el-carousel-item v-for="item in roomList" :key="item.id">
            <ThreeRoom :scale="scale" :item="item" :is-screen="true" v-if="roomId === item.id"></ThreeRoom>
          </el-carousel-item>
        </el-carousel>
      </el-col>
      <el-col :span="8" class="right">
        <div class="card  m-b">
          <div class="card-title">机房环境设备</div>
          <div class="card-body">
            <el-row :gutter="15">
              <el-col :span="12" v-for="(item, index) in equipmentCount" :key="index">
                <DeviceStatus class="device-status" :icon="`/scr-web/static/img/room/${item.name}.png`" :data="[{text: `通 ${item.onNum}`},{text: `断 ${item.offNum}`, color: '#F84540'}]"></DeviceStatus>
              </el-col>
            </el-row>
          </div>
        </div>
        <div class="card  m-b">
          <div class="card-title">环境设备性能展示</div>
          <div class="card-body">
            <DeviceTable :data="deviceList"></DeviceTable>
          </div>
        </div>
        <div class="card">
          <div class="card-title m-b-sm">机房设备实时告警</div>
          <div class="card-body">
            <AlarmList :data="alarmList"></AlarmList>
          </div>
        </div>
      </el-col>
    </el-row>
  </ScreenWrapper>
</template>
<script>
import {
  reactive,
  toRefs,
  computed,
  onUnmounted,
  nextTick
} from '@vue/composition-api'
import ThreeRoom from 'views/three_room/room'
import ScreenWrapper from 'components/ScreenWrapper'
import DeviceStatus from 'components/DeviceStatus'
import AlarmList from './AlarmList'
import DeviceTable from './DeviceTable'
import OverviewState from 'components/OverviewState'
import { overviewConfigs } from './data'
import {
  getRooms,
  getOverview,
  getCount,
  getEquipmentCount,
  getAlarmCount,
  getServerCount,
  getDeviceList,
  getAlertList
} from 'services/screen/room'
export default {
  components: {
    ScreenWrapper,
    DeviceStatus,
    AlarmList,
    DeviceTable,
    OverviewState,
    ThreeRoom
  },
  setup() {
    const state = reactive({
      scale: 1,
      overviewConfigs,
      deviceCount: {},
      alarmCount: [],
      equipmentCount: [],
      serverTop10: {},
      deviceList: [],
      alarmList: [],
      roomList: [],
      loading: true,
      roomId: 0,
      deviceTopType: 'cpu'
    })
    const getScale = (scale) => {
      state.scale = scale
    }
    const changeRoom = (index) => {
      state.roomId = state.roomList[index].id
      change()
    }
    // 总体情况
    const getOverviewState = async () => {
      const res = await getOverview()
      if (res.success) {
        // 处理数据对configs赋值
        const { centerNum, rackNum, loadRatio } = res.data
        const unit = state.overviewConfigs[0]
        ;[centerNum, rackNum, loadRatio * 100].forEach((item, index) => {
          unit.data[index].value = item
        })
      }
    }
    // 设备信息
    const getDeviceCount = async () => {
      const res = await getCount(state.roomId)
      if (res.success) {
        state.deviceCount = res.data
      }
    }
    // 告警次数统计
    const getAlarmOverview = async () => {
      const res = await getAlarmCount(state.roomId)
      if (res.success) {
        state.alarmCount = res.data
      }
    }
    // 机房环境设备
    const getEquipment = async () => {
      const res = await getEquipmentCount(state.roomId)
      if (res.success) {
        state.equipmentCount = res.data
      }
    }
    // top10
    const getServerTop10 = async () => {
      const res = await getServerCount(state.roomId, {
        type: state.deviceTopType
      })
      if (res.success) {
        state.serverTop10 = res.data
      }
    }
    // 机房环境设备性能展示
    const getDeviceData = async () => {
      const res = await getDeviceList(state.roomId)
      if (res.success) {
        state.deviceList = res.data
      }
    }
    // 机房设备实时告警
    const getAlarmList = async () => {
      const res = await getAlertList(state.roomId)
      if (res.success) {
        state.alarmList = res.data
      }
    }
    const change = async () => {
      await Promise.all([
        getOverviewState(),
        getDeviceCount(),
        getAlarmOverview(),
        getEquipment(),
        getServerTop10(),
        getDeviceData(),
        getAlarmList()
      ])
      state.loading = false
    }
    const dcInfoConfigs = {
      richCount: 60,
      legend: {
        itemGap: 10
      },
      center: ['50%', '40%']
    }
    const getRoomList = async () => {
      const res = await getRooms()
      if (res.success) {
        state.roomList = res.data.rows
        await nextTick()
        changeRoom(0)
      }
    }
    getRoomList()
    return {
      ...toRefs(state),
      dcInfoConfigs,
      interval: 1000 * 30,
      getServerTop10,
      getScale,
      changeRoom
    }
  }
}
</script>
<style lang="scss" scoped>
.left,
.right {
  width: 25%;
}
.center {
  width: 50%;
  ::v-deep {
    .el-carousel__container {
      height: 835px;
    }
  }
}
.device-status ::v-deep .title-icon {
  width: 80px;
  height: 76px;
}
.card {
  // height: calc((100vh - 170px) / 3 - 20px);
  .card-operate {
    float: right;
    ::v-deep {
      .el-radio-button__inner {
        background: #0a1636;
        border-color: #66718c;
        color: #fff;
      }
      .el-radio-button__orig-radio:checked + .el-radio-button__inner {
        border-color: #409eff;
        box-shadow: -1px 0 0 0 #409eff;
      }
    }
  }
  height: 280px;
  .card-title {
    font-size: 18px;
    border-left: 3px solid #0089ff;
    font-weight: bold;
    color: #bbefff;
    padding-left: 5px;
    margin-bottom: 5px;
  }
  .card-body {
    height: calc(100% - 35px);
  }
}
</style>
