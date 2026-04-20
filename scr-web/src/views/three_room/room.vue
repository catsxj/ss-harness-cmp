<template>
  <div class="room-container" :class="{screen: isScreen}" id="three_room">
    <div class="room-title">
      <div>{{item.name}}</div>
    </div>
    <div class="rack-info" :style="rackInfoStyle">
      <div class="rack-header">{{ currentRack.name }}机柜</div>
      <div class="rack-content">
        <div class="rack-item">
          <span>机柜名称：</span>
          <span>{{ currentRack.name }}</span>
        </div>
        <div class="rack-item">
          <span>数据中心：</span>
          <span>{{currentRack.dcname}}</span>
        </div>
        <div class="rack-item">
          <span>所属机房：</span>
          <span>{{currentRack.roomname}}</span>
        </div>
        <div class="rack-item">
          <span>机柜类型：</span>
          <span>{{currentRack.typeName}}</span>
        </div>
        <div class="rack-item">
          <span>使用率：</span>
          <span>
            <Progress :percent="currentRack.usage * 100" style="margin-top: 2px"></Progress>
          </span>
        </div>
      </div>
    </div>
    <div class="tools">
       <i class="el-icon-refresh-right tool-item" title="重置" @click="resetRack"></i>
      <i class="el-icon-data-line tool-item" :class="{active: status === 'usage'}" title="机柜使用率" @click="showRackUsage"></i>
      <i class="el-icon-brush tool-item"   :class="{active: status === 'capacity'}" title="机柜容量" @click="showRackCapacity"></i>
      <i class="el-icon-c-scale-to-original tool-item"  title="温度云展示" @click="operateTemperature"></i>
    </div>
    <ThreeRack ref="rackRef" :item="currentRack" v-if="rackVisible" :scale="scale" @closeRack="closeRack"></ThreeRack>
    <div class="loading" v-if="loading">
      <dv-decoration-12 style="width:200px;height:200px;" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, toRefs, watch, ref } from 'vue'
import Progress from 'components/SimpleProgress/index.vue'
import ThreeRoom from '@/three/ThreeRoom'
import ThreeRack from './rack.vue'
import { generateRackLocation, generateRacks } from '@/three/components/tools'
import { getRacks } from 'services/screen/room'

interface RackData {
  name: string
  dcname: string
  roomname: string
  typeName: string
  usage: number
  [key: string]: unknown
}

interface RoomItem {
  id: number
  name: string
  config: string
  rowNum?: number
  colNum?: number
}

interface Props {
  item: RoomItem
  isScreen?: boolean
  scale?: number
}

const props = withDefaults(defineProps<Props>(), {
  isScreen: false,
  scale: 1
})

const state = reactive({
  rackInfoStyle: {} as Record<string, string>,
  currentRack: {} as RackData,
  rackVisible: false,
  loading: true,
  status: ''
})

const { rackInfoStyle, currentRack, rackVisible, loading, status } = toRefs(state)

const rackRef = ref<InstanceType<typeof ThreeRack> | null>(null)

// 机柜概要信息展示
const showRackInfo = (e: MouseEvent, item: { userData: RackData }) => {
  const dom = document.getElementById('three_room')!
  const { left, top } = dom.getBoundingClientRect()
  state.rackInfoStyle = {
    top: `${(e.y - top) / props.scale - 100}px`,
    left: `${(e.x - left) / props.scale + 20}px`,
    display: 'block'
  }
  state.currentRack = item.userData
}

const closeRackInfo = () => {
  state.rackInfoStyle.display = 'none'
}

let threeRoom: InstanceType<typeof ThreeRoom> | null = null
let location: Record<string, unknown> = {}

const options: Record<string, unknown> = {
  showRackInfo,
  closeRackInfo,
  needBindEvent: true,
  scale: props.scale,
  test: props.item.name,
  rackOptions: {
    clickRack: () => {
      threeRoom && threeRoom.removeEvent()
      closeRackInfo()
      state.rackVisible = true
    }
  }
}

watch(
  () => props.scale,
  (value) => {
    options.scale = value
    if (rackRef.value) {
      rackRef.value.setScale(value)
    }
  }
)

onMounted(() => {
  const { id, config, rowNum = 2, colNum = 2 } = props.item
  if (props.isScreen) {
    options.camera = {
      VIEW_ANGLE: 50,
      position: {
        x: 0,
        y: 800,
        z: 1000
      }
    }
  }
  threeRoom = new ThreeRoom(document.getElementById('three_room'), options)
  threeRoom.createRoom(JSON.parse(config))
  location = generateRackLocation(700, 500, colNum, rowNum)
  console.log(location)
  getRackList(id)
})

let racks: Record<string, unknown>[] = []

const getRackList = async (roomId: number) => {
  state.loading = true
  const res = await getRacks(roomId)
  if (res.success) {
    racks = res.data.rows.map((item: Record<string, unknown>) => {
      const { config, axisX, axisY } = item
      const configObj = JSON.parse(config as string)
      console.log(item.name, location[`${axisY},${axisX}`])
      const result: Record<string, unknown> = {
        ...item,
        servers: [],
        config:
          (configObj && configObj.position) ||
          location[`${axisY},${axisX}`]
      }
      if ((item.usage as number) > 0.9) {
        result.alarmLevel = 'danger'
      } else if ((item.usage as number) > 0.75) {
        result.alarmLevel = 'warning'
      }
      return result
    })
    threeRoom!.createRack(racks)
    state.loading = false
  }
}

// 展示使用率
const showRackUsage = () => {
  if (state.status === 'usage') return
  state.status = 'usage'
  threeRoom!.createRackUsage(racks)
}

// 机柜容量
const showRackCapacity = () => {
  if (state.status === 'capacity') return
  state.status = 'capacity'
  threeRoom!.createRackCapacity(racks)
}

// 重置
const resetRack = () => {
  state.status = ''
  threeRoom!.resetRack()
}

// 温度云
const operateTemperature = () => {
  threeRoom!.operateTemperature()
}

onUnmounted(() => {
  threeRoom && threeRoom.destory()
  threeRoom = null
})

const closeRack = () => {
  threeRoom && threeRoom.bindEvent()
  state.rackVisible = false
}
</script>
<style lang="scss" scoped>
.room-container {
  background: #101930;
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
  &.screen {
    background: none;
    .room-title {
      font-size: 30px;
      div {
        top: -25px;
      }
    }
  }
}
.room-title {
  background: url('/scr-web/static/img/room_title.png') no-repeat;
  background-size: 100% 100%;
  width: 100%;
  text-align: center;
  font-size: 40px;
  position: absolute;
  top: 40px;
  left: 0;
  color: #85cefa;
  font-weight: bold;
  height: 35px;
  div {
    top: -35px;
    left: 30%;
    width: 41%;
    text-align: center;
    position: absolute;
  }
}
.rack-info {
  display: none;
  min-width: 200px;
  position: absolute;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  border-radius: 2px;
  .rack-header {
    background: #00818e;
    padding: 10px 15px;
  }
  .rack-content {
    padding: 15px;
    font-size: 12px;
    .rack-item {
      margin-bottom: 5px;
      display: flex;
      span:nth-child(1) {
        width: 60px;
        text-align: right;
      }
      span:nth-child(2) {
        flex: 1;
      }
    }
  }
}
.loading {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 20px;
}
.tools{
  display: flex;
  flex-direction: column;
  position: absolute;
  right: 10px;
  top: 100px;
  background: #5071c5;
  padding: 20px 5px;
  border-radius: 2px;
  .tool-item{
    font-size: 18px;
    color: #ccc;
    cursor: pointer;
    margin-bottom: 10px;
    &.active{
      color: #fff;
    }
  }
}
</style>
