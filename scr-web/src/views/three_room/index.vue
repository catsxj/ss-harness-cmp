<template>
  <div class="three-container">
    <template v-for="item in roomList">
      <ThreeRoom :key="item.id" :item="item" v-if="item.id === roomId" :source="source" />
    </template>
    <div class="room-switch" :class="{collapsed: isCollapsed}" v-if="source !== 'screen'">
      <div class="room-item" :class="{selected: item.id === roomId}" @click="switchRoom(item.id)" v-for="item in roomList" :key="item.id">{{item.name}}</div>
      <i class="toggle" :class="isCollapsed? 'el-icon-arrow-right' : 'el-icon-arrow-left'" @click="toggle"></i>
    </div>
    <div class="loading" v-if="loading">
      <dv-decoration-12 style="width:200px;height:200px;" />
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted, reactive, toRefs } from '@vue/composition-api'
import ThreeRoom from './room'
import { getRooms } from 'services/screen/room'
export default {
  components: {
    ThreeRoom
  },
  setup(props, context) {
    const state = reactive({
      loading: true,
      roomList: [],
      roomId: context.root.$route.params.id / 1,
      source: context.root.$route.query.source,
      isCollapsed: true
    })
    const getRoomList = async () => {
      const data = await getRooms()
      if (data.success) {
        state.roomList = data.data.rows
        state.loading = false
      }
    }
    getRoomList()
    const switchRoom = (roomId) => {
      if (state.roomId === roomId) return
      state.roomId = roomId
    }
    const toggle = () => {
      state.isCollapsed = !state.isCollapsed
    }
    return {
      ...toRefs(state),
      switchRoom,
      toggle
    }
  }
}
</script>
<style lang="scss">
.three-container{
  width: 100vw;
  height: 100vh;
}
@media screen and (min-width: 1600px) {
  .room-switch {
    width: 200px;
    &.collapsed {
      transform: translateX(-180px);
    }
  }
}
.room-switch {
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: absolute;
  top: 80px;
  left: 0;
  transition: transform 0.2s;
  width: 285px;
  padding-right: 40px;
  box-sizing: border-box;
  height: calc(100vh - 80px);
  background: url('/scr-web/static/img/three_room/menu_bg.png') no-repeat;
  background-size: 100% 100%;
  opacity: 0.8;
  color: #fff;
  cursor: pointer;
  &.collapsed {
    transform: translateX(-265px);
  }
  .toggle {
    position: absolute;
    top: 50%;
    right: 0px;
    transition: all 0.1s;
    font-size: 20px;
    &:hover {
      transform: scale(1.2);
    }
  }
  .room-item {
    padding: 25px 13px;
    font-size: 16px;
    &.selected {
      background: url('/scr-web/static/img/three_room/item_select.png') no-repeat;
      background-size: 100% 100%;
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
</style>
