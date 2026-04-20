<template>
  <vue-seamless-scroll :data="data" class="alarm-wrapper" :class-option="{step: 1}">
    <div class="alarm-list">
      <div class="alarm-container">
        <div class="alarm-item" v-for="(item, index) in data" :key="index">
          <div class="item-node"></div>
          <div class="item-wrapper">
            <div class="item-icon" :style="{background: alarmColorFilter(item.level)}"></div>
            <span class="item-text"  :title="`${item.level} ${item.time} ${item.name} ${item.info}`">{{`${item.level} ${item.time} ${item.name} ${item.info}`}}</span>
          </div>
        </div>
      </div>
    </div>
    <NoData v-if="!data.length" icon="el-icon-message-solid" text="暂无告警数据"></NoData>
  </vue-seamless-scroll>
</template>
<script>
import { ref, computed, onMounted, onUnmounted } from '@vue/composition-api'
import vueSeamlessScroll from 'vue-seamless-scroll'
import NoData from 'components/NoData'
function alarmColorFilter(value) {
  const map = {
    严重告警: '#F84540',
    重要告警: '#FF9900',
    次要警告: '#19BE6B',
    提示告警: '#2D8CF0'
  }
  return map[value]
}
export default {
  components: {
    vueSeamlessScroll, NoData
  },
  props: {
    data: {
      type: Array
    }
  },
  setup(props) {
    return {
      alarmColorFilter
    }
  }
}
</script>
<style lang="scss" scoped>
.alarm-wrapper{
  height: 100%;
  overflow: hidden;
}
.alarm-list {
  padding-left: 5px;
  height: 100%;
  overflow: hidden;
}
.alarm-container {
  border-left: 2px solid #013e70;
  // margin-left: 5px;
  box-sizing: border-box;
  .alarm-item {
    padding-left: 11px;
    position: relative;
    margin-bottom: 6px;
    box-sizing: border-box;
  }
  .item-node {
    position: absolute;
    top: 13.5px;
    left: -5px;
    width: 9px;
    height: 9px;
    background: #013e70;
    border: 2px solid #00a0e9;
    box-sizing: border-box;
    border-radius: 50%;
  }
  .item-wrapper {
    width: calc(100% - 30px);
    height: 36px;
    display: flex;
    align-items: center;
    padding: 0 11px;
    background: #122043;
    .item-text{
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }
    .item-icon {
      position: relative;
      display: inline-block;
      width: 19px;
      height: 19px;
      border-radius: 50%;
      background: #f84540;
      margin-right: 9px;
      &::after {
        content: '';
        position: absolute;
        border-radius: 1px;
        width: 6.5px;
        height: 6.5px;
        display: inline-block;
        top: 6.5px;
        left: 6.5px;
        background: #122043;
      }
    }
  }
}
</style>
